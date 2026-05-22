


import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Users, 
  Search, 
  UserPlus,
  Loader2,
  ChevronLeft,
  ChevronRight,
  UserMinus,
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  Wallet,
  Lock,
  Unlock,
  Eye,
  History
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { usersService } from '@/services/api/users.service'
import { adminService } from '@/services/api/admin.service'
import { User as UserType } from '@/store/auth-store'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CreateStaffDialog } from '@/components/admin/create-staff-dialog'
import { useDebounce } from '@/hooks/use-debounce'

export function UserManagementPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<UserType[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('')
  const [role, setRole] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [userWallets, setUserWallets] = useState<Record<string, any>>({})
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const debouncedSearch = useDebounce(search, 300)

  // Reset page to 1 when filters or search change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, status, role])

  useEffect(() => {
    fetchUsers()
  }, [page, limit, status, role, debouncedSearch])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const data = await usersService.getAllUsers({ 
        page, 
        limit,
        status: status || undefined,
        role: role || undefined,
        search: debouncedSearch || undefined
      })
      setUsers(data.data)
      setTotal(data.meta?.total || 0)
      
      // Fetch wallet info for these users
      const wallets: Record<string, any> = {}
      for (const user of data.data) {
        try {
          const wallet = await adminService.getWalletByUserId(user.id)
          wallets[user.id] = wallet
        } catch (e) {
          console.warn(`Could not fetch wallet for user ${user.id}`)
        }
      }
      setUserWallets(wallets)
    } catch (err) {
      console.error('Error fetching users:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      setIsProcessing(id)
      await usersService.approveUser(id)
      await fetchUsers()
    } catch (err) {
      console.error('Error approving user:', err)
    } finally {
      setIsProcessing(null)
    }
  }

  const handleDeactivate = async (id: string) => {
    if (!confirm('Are you sure you want to permanently deactivate this user?')) return
    try {
      setIsProcessing(id)
      await usersService.deactivateUser(id)
      await fetchUsers()
    } catch (err) {
      console.error('Error deactivating user:', err)
    } finally {
      setIsProcessing(null)
    }
  }

  const handleToggleWalletLock = async (userId: string, isLocked: boolean) => {
    try {
      setIsProcessing(userId)
      if (isLocked) {
        await adminService.unlockWallet(userId)
      } else {
        await adminService.lockWallet(userId)
      }
      await fetchUsers()
    } catch (err) {
      console.error('Error toggling wallet lock:', err)
    } finally {
      setIsProcessing(null)
    }
  }

  const handleToggleStatus = async (user: UserType) => {
    try {
      setIsProcessing(user.id)
      if (user.status === 'ACTIVE') {
        await usersService.suspendUser(user.id)
      } else {
        await usersService.activateUser(user.id)
      }
      await fetchUsers()
    } catch (err) {
      console.error('Error toggling user status:', err)
    } finally {
      setIsProcessing(null)
    }
  }

  const totalPages = Math.ceil(total / limit)

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success'
      case 'PENDING': return 'warning'
      case 'SUSPENDED': return 'destructive'
      case 'DEACTIVATED': return 'secondary'
      default: return 'secondary'
    }
  }

  return (
    <div className="min-h-screen bg-[#070c1e] text-white p-6 md:p-10 font-sans selection:bg-emerald-500/30 space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5 mb-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)} 
            className="rounded-full border border-white/5 bg-[#0f1630] text-zinc-400 hover:text-emerald-400 hover:bg-[#141d3d] transition-all duration-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">User Management</h1>
            <p className="text-xs text-zinc-400 mt-1">View and manage all registered accounts.</p>
          </div>
        </div>
        <Button 
          className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Create Staff
        </Button>
      </div>

      <Card className="border border-white/5 bg-[#0f1630] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-emerald-500/20 hover:shadow-[0_0_25px_rgba(16,185,129,0.08)]">
        <CardHeader className="p-4 md:p-6 border-b border-white/5 bg-[#0b1026]">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
              <Input 
                placeholder="Search by name, email, or ID..." 
                className="pl-11 h-11 rounded-xl bg-[#141d3d] border border-white/5 text-sm text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-emerald-500/50 transition-all duration-300" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-11 px-4 py-2 bg-[#141d3d] border border-white/5 rounded-xl text-xs font-semibold text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="DEACTIVATED">Deactivated</option>
              </select>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="h-11 px-4 py-2 bg-[#141d3d] border border-white/5 rounded-xl text-xs font-semibold text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all cursor-pointer"
              >
                <option value="">All Roles</option>
                <option value="CUSTOMER">Customer</option>
                <option value="WORKER">Worker</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-[11px] text-zinc-400 uppercase tracking-widest bg-[#0b1026]/60 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 font-bold">User</th>
                  <th className="px-6 py-4 font-bold">Role</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Joined</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  [1, 2, 3, 4, 5].map(i => (
                    <tr key={i} className="animate-pulse bg-[#0f1630] px-10 py-10">
                      <td colSpan={5} className="px-10 py-10">
                        <div className="h-10 bg-[#162045] rounded-xl" />
                      </td>
                    </tr>
                  ))
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="group hover:bg-[#131c3d]/60 transition-all duration-300 ease-out">
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3.5">
                          <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold group-hover:scale-105 group-hover:border-emerald-500/30 group-hover:text-emerald-400 transition-all duration-300">
                            {user.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-zinc-200 group-hover:text-white transition-colors">{user.fullName}</p>
                            <p className="text-xs text-zinc-500 font-medium">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        <Badge variant="outline" className="font-extrabold uppercase text-[9px] tracking-wider border-white/10 bg-white/5 text-zinc-300 px-2 py-0.5">
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4.5">
                        <Badge 
                          variant={getStatusVariant(user.status)}
                          className={cn(
                            "text-[10px] uppercase tracking-wider font-extrabold border-none px-2.5 py-0.5 rounded-full",
                            user.status === 'ACTIVE' && "bg-emerald-500/10 text-emerald-400",
                            user.status === 'PENDING' && "bg-amber-500/10 text-amber-400",
                            user.status === 'SUSPENDED' && "bg-red-500/10 text-red-400",
                            user.status === 'DEACTIVATED' && "bg-zinc-700 text-zinc-300"
                          )}
                        >
                          {user.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4.5 text-xs text-zinc-400">
                        {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg text-blue-400 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 transition-all duration-300"
                            onClick={() => setSelectedUser(user)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {user.status === 'PENDING' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 rounded-lg text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-all duration-300"
                              onClick={() => handleApprove(user.id)}
                              disabled={isProcessing === user.id}
                              title="Approve User"
                            >
                              <ShieldCheck className="h-4 w-4" />
                            </Button>
                          )}

                          {user.status !== 'DEACTIVATED' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className={cn(
                                "h-8 w-8 rounded-lg border border-transparent transition-all duration-300",
                                user.status === 'ACTIVE' 
                                  ? "text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/20" 
                                  : "text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/20"
                              )}
                              onClick={() => handleToggleStatus(user)}
                              disabled={isProcessing === user.id}
                              title={user.status === 'ACTIVE' ? "Suspend User" : "Activate User"}
                            >
                              {isProcessing === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                user.status === 'ACTIVE' ? <UserMinus className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />
                              )}
                            </Button>
                          )}

                          {userWallets[user.id] && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className={cn(
                                "h-8 w-8 rounded-lg border border-transparent transition-all duration-300",
                                userWallets[user.id].isLocked 
                                  ? "text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/20" 
                                  : "text-red-400 hover:bg-red-500/10 hover:border-red-500/20"
                              )}
                              onClick={() => handleToggleWalletLock(user.id, userWallets[user.id].isLocked)}
                              disabled={isProcessing === user.id}
                              title={userWallets[user.id].isLocked ? "Unlock Wallet" : "Lock Wallet"}
                            >
                              {userWallets[user.id].isLocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                            </Button>
                          )}

                          {user.status !== 'DEACTIVATED' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 rounded-lg text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-300"
                              onClick={() => handleDeactivate(user.id)}
                              disabled={isProcessing === user.id}
                              title="Deactivate User"
                            >
                              <ShieldAlert className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-24 text-center bg-[#0f1630]">
                      <Users className="h-12 w-12 text-zinc-700 mx-auto mb-4 animate-pulse" />
                      <h3 className="text-base font-bold text-zinc-300">No users found</h3>
                      <p className="text-xs text-zinc-500 mt-0.5">No registered accounts match your dynamic search configuration.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4.5 border-t border-white/5 bg-[#0b1026]/40">
              <p className="text-xs text-zinc-400 font-medium">
                Page <span className="text-emerald-400 font-black">{page}</span> of <span className="text-white font-black">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-xl border border-white/5 bg-[#141d3d] hover:bg-[#1c2957] text-white disabled:opacity-40 transition-colors duration-300"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-xl border border-white/5 bg-[#141d3d] hover:bg-[#1c2957] text-white disabled:opacity-40 transition-colors duration-300"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <Card className="w-full max-w-lg overflow-hidden border border-white/10 bg-[#0f1630] text-white rounded-2xl shadow-2xl shadow-black/80">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 bg-[#0b1026] p-4.5">
              <h3 className="font-bold text-base text-zinc-200 tracking-wide">User Profile Summary</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSelectedUser(null)} 
                className="rounded-full h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-20 w-20 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)] flex items-center justify-center text-3xl font-black">
                  {selectedUser.fullName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xl font-bold tracking-tight text-white">{selectedUser.fullName}</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">{selectedUser.email}</p>
                </div>
                <div className="flex gap-2">
                  <Badge 
                    variant={getStatusVariant(selectedUser.status)}
                    className={cn(
                      "text-[10px] uppercase tracking-wider font-extrabold border-none px-3 py-0.5 rounded-full",
                      selectedUser.status === 'ACTIVE' && "bg-emerald-500/10 text-emerald-400",
                      selectedUser.status === 'PENDING' && "bg-amber-500/10 text-amber-400",
                      selectedUser.status === 'SUSPENDED' && "bg-red-500/10 text-red-400",
                      selectedUser.status === 'DEACTIVATED' && "bg-zinc-700 text-zinc-300"
                    )}
                  >
                    {selectedUser.status}
                  </Badge>
                  <Badge variant="outline" className="font-extrabold uppercase text-[10px] tracking-wider border-white/10 bg-white/5 text-zinc-300 px-3 py-0.5 rounded-full">
                    {selectedUser.role}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5 text-xs">
                <div className="space-y-1">
                  <p className="font-semibold text-zinc-500 uppercase tracking-wider">User ID</p>
                  <p className="font-bold text-zinc-200 truncate" title={selectedUser.id}>{selectedUser.id.slice(0, 8).toUpperCase()}...</p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-zinc-500 uppercase tracking-wider">Phone</p>
                  <p className="font-bold text-zinc-200">{selectedUser.phone || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-zinc-500 uppercase tracking-wider">Joined Date</p>
                  <p className="font-bold text-zinc-200">{format(new Date(selectedUser.createdAt), 'MMMM dd, yyyy')}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-zinc-500 uppercase tracking-wider">Last Sync</p>
                  <p className="font-bold text-zinc-200">{format(new Date(selectedUser.updatedAt), 'MMMM dd, yyyy')}</p>
                </div>
              </div>

              {userWallets[selectedUser.id] && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#161f3d] to-[#0c1229] border border-white/5 space-y-2 relative overflow-hidden group">
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-emerald-400" />
                      <p className="text-xs font-semibold text-zinc-300">Wallet Balance</p>
                    </div>
                    {userWallets[selectedUser.id].isLocked && (
                      <Badge className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider border-none bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">
                        <Lock className="h-2.5 w-2.5" /> LOCKED
                      </Badge>
                    )}
                  </div>
                  <p className="text-2xl font-black text-white relative z-10 tracking-tight">
                    {userWallets[selectedUser.id].currency} {Number(userWallets[selectedUser.id].balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <div className="absolute -right-12 -bottom-12 h-24 w-24 bg-emerald-500/5 group-hover:bg-emerald-500/10 blur-xl rounded-full transition-colors duration-500" />
                </div>
              )}

              <div className={cn("grid gap-3 pt-2", selectedUser.role === 'ADMIN' ? "grid-cols-2" : "grid-cols-3")}>
                <Button 
                  variant="outline" 
                  className="rounded-xl w-full border border-white/5 bg-[#141d3d] hover:bg-[#1c2957] text-zinc-300 hover:text-white font-medium transition-colors duration-300" 
                  onClick={() => setSelectedUser(null)}
                >
                  Close
                </Button>
                <Button 
                  variant="outline" 
                  className="rounded-xl w-full border border-white/5 bg-[#141d3d] hover:bg-[#1c2957] text-zinc-300 hover:text-white font-medium transition-colors duration-300"
                  onClick={() => navigate(`/admin/wallets/${selectedUser.id}`)}
                >
                  <Wallet className="mr-2 h-4 w-4 text-emerald-400" />
                  Wallet
                </Button>
                {selectedUser.role === 'CUSTOMER' && (
                  <Button 
                    className="rounded-xl w-full bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all duration-300"
                    onClick={() => navigate(`/admin/wallets/${selectedUser.id}`)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ledger
                  </Button>
                )}
                {selectedUser.role === 'WORKER' && (
                  <Button 
                    className="rounded-xl w-full bg-purple-600 hover:bg-purple-500 text-white font-medium transition-all duration-300"
                    onClick={() => navigate(`/admin/wallets/${selectedUser.id}`)}
                  >
                    <History className="mr-2 h-4 w-4" />
                    Activity
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <CreateStaffDialog 
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => fetchUsers()}
      />
    </div>
  )
}


