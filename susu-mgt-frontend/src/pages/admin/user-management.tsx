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
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">User Management</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">View and manage all registered accounts.</p>
          </div>
        </div>
        <Button 
          className="rounded-full"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Create Staff
        </Button>
      </div>

      <Card>
        <CardHeader className="p-4 md:p-6 border-b dark:border-zinc-800">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                placeholder="Search by name, email, or ID..." 
                className="pl-10 h-10 rounded-full" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-10 px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 transition-colors"
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
                className="h-10 px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 transition-colors"
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
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-50/50 dark:bg-zinc-900/50 border-b dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-bold">User</th>
                  <th className="px-6 py-4 font-bold">Role</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Joined</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-zinc-800">
                {isLoading ? (
                  [1, 2, 3, 4, 5].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
                      </td>
                    </tr>
                  ))
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 flex items-center justify-center font-bold">
                            {user.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-zinc-900 dark:text-zinc-100">{user.fullName}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="font-bold uppercase text-[10px]">
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusVariant(user.status)}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                        {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-lg text-zinc-500 hover:bg-zinc-100"
                            onClick={() => setSelectedUser(user)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {user.status === 'PENDING' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-lg text-emerald-600 hover:bg-emerald-50"
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
                                "rounded-lg",
                                user.status === 'ACTIVE' ? "text-amber-600 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50"
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
                                "rounded-lg",
                                userWallets[user.id].isLocked ? "text-emerald-600 hover:bg-emerald-50" : "text-red-600 hover:bg-red-50"
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
                              className="rounded-lg text-red-600 hover:bg-red-50"
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
                    <td colSpan={5} className="px-6 py-24 text-center">
                      <Users className="h-12 w-12 text-zinc-200 dark:text-zinc-800 mx-auto mb-4" />
                      <p className="text-zinc-500 dark:text-zinc-400">No users found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-6 border-t dark:border-zinc-800">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Page <span className="text-zinc-900 dark:text-zinc-100 font-bold">{page}</span> of <span className="text-zinc-900 dark:text-zinc-100 font-bold">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-xl"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-xl"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-lg overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b dark:border-zinc-800 p-4">
              <h3 className="font-bold text-lg">User Profile</h3>
              <Button variant="ghost" size="icon" onClick={() => setSelectedUser(null)} className="rounded-full">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-24 w-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-4xl font-bold">
                  {selectedUser.fullName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{selectedUser.fullName}</h4>
                  <p className="text-zinc-500 dark:text-zinc-400">{selectedUser.email}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={getStatusVariant(selectedUser.status)} className="px-3 py-1 uppercase font-bold text-xs">
                    {selectedUser.status}
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1 uppercase font-bold text-xs">
                    {selectedUser.role}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y dark:border-zinc-800">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-zinc-400 uppercase">User ID</p>
                  <p className="font-medium text-sm truncate" title={selectedUser.id}>{selectedUser.id.slice(0, 8)}...</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-zinc-400 uppercase">Phone</p>
                  <p className="font-medium text-sm">{selectedUser.phone || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-zinc-400 uppercase">Joined</p>
                  <p className="font-medium text-sm">{format(new Date(selectedUser.createdAt), 'MMMM dd, yyyy')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-zinc-400 uppercase">Last Updated</p>
                  <p className="font-medium text-sm">{format(new Date(selectedUser.updatedAt), 'MMMM dd, yyyy')}</p>
                </div>
              </div>

              {userWallets[selectedUser.id] && (
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-blue-600" />
                      <p className="font-bold">Wallet Balance</p>
                    </div>
                    {userWallets[selectedUser.id].isLocked && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <Lock className="h-3 w-3" /> LOCKED
                      </Badge>
                    )}
                  </div>
                  <p className="text-3xl font-black text-zinc-900 dark:text-zinc-100">
                    {userWallets[selectedUser.id].currency} {Number(userWallets[selectedUser.id].balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}

              <div className={cn("grid gap-3", selectedUser.role === 'ADMIN' ? "grid-cols-2" : "grid-cols-3")}>
                <Button variant="outline" className="rounded-xl w-full" onClick={() => setSelectedUser(null)}>
                  Close
                </Button>
                <Button 
                  variant="outline" 
                  className="rounded-xl w-full"
                  onClick={() => navigate(`/admin/wallets/${selectedUser.id}`)}
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Wallet
                </Button>
                {selectedUser.role === 'CUSTOMER' && (
                  <Button 
                    className="rounded-xl w-full"
                    onClick={() => navigate(`/admin/wallets/${selectedUser.id}`)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Transactions
                  </Button>
                )}
                {selectedUser.role === 'WORKER' && (
                  <Button 
                    className="rounded-xl w-full"
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
