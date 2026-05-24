


import { useState } from 'react'
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
import { User as UserType } from '@/store/auth-store'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CreateStaffDialog } from '@/components/admin/create-staff-dialog'
import { useDebounce } from '@/hooks/use-debounce'
import { useAdminUIStore } from '@/store/admin-ui-store'
import { 
  useUsers, 
  useWalletDetails, 
  useApproveUser, 
  useDeactivateUser, 
  useSuspendUser, 
  useActivateUser, 
  useLockWallet, 
  useUnlockWallet 
} from '@/hooks/use-admin'

function WalletLockAction({ userId, disabled, className }: { userId: string, disabled: boolean, className?: string }) {
  const { data: wallet } = useWalletDetails(userId)
  const lockWallet = useLockWallet()
  const unlockWallet = useUnlockWallet()

  if (!wallet) return null

  const isProcessing = lockWallet.isPending || unlockWallet.isPending || disabled
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className={cn(
        "h-7 w-7 rounded-md p-0 shrink-0 transition-colors",
        wallet.isLocked ? "text-emerald-400 hover:bg-emerald-500/10" : "text-red-400 hover:bg-red-500/10",
        className
      )}
      onClick={() => wallet.isLocked ? unlockWallet.mutate(userId) : lockWallet.mutate(userId)}
      disabled={isProcessing}
      title={wallet.isLocked ? "Unlock Wallet" : "Lock Wallet"}
    >
      {wallet.isLocked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
    </Button>
  )
}

function WalletDetailsCard({ userId }: { userId: string }) {
  const { data: wallet } = useWalletDetails(userId)
  if (!wallet) return null

  return (
    <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#161f3d] to-[#0c1229] border border-white/5 space-y-1 relative overflow-hidden group w-full shrink-0">
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-1.5">
          <Wallet className="h-3.5 w-3.5 text-emerald-400" />
          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Wallet Balance</p>
        </div>
        {wallet.isLocked && (
          <Badge className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wider border-none bg-red-500/10 text-red-400 px-1.5 py-0.2 rounded shrink-0">
            <Lock className="h-2.5 w-2.5" /> LOCKED
          </Badge>
        )}
      </div>
      <p className="text-lg sm:text-xl font-black text-white relative z-10 tracking-tight">
        {wallet.currency} {Number(wallet.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </p>
    </div>
  )
}

export function UserManagementPage() {
  const navigate = useNavigate()
  
  const { 
    search, setSearch,
    statusFilter, setStatusFilter,
    roleFilter, setRoleFilter,
    page, setPage,
    selectedUser, setSelectedUser
  } = useAdminUIStore((state) => state.userManagement)

  const [limit] = useState(10)
  const debouncedSearch = useDebounce(search, 300)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const { data, isLoading } = useUsers({
    page,
    limit,
    status: statusFilter || undefined,
    role: roleFilter || undefined,
    search: debouncedSearch || undefined
  })

  const users = data?.data || []
  const total = data?.meta?.total || 0
  const totalPages = Math.ceil(total / limit)

  const approveUser = useApproveUser()
  const deactivateUser = useDeactivateUser()
  const suspendUser = useSuspendUser()
  const activateUser = useActivateUser()

  const handleApprove = (id: string) => {
    approveUser.mutate({ id, remarks: 'Account approved by admin' })
  }

  const handleDeactivate = (id: string) => {
    if (!confirm('Are you sure you want to permanently deactivate this user?')) return
    deactivateUser.mutate(id)
  }

  const handleToggleStatus = (user: UserType) => {
    if (user.status === 'ACTIVE') {
      suspendUser.mutate(user.id)
    } else {
      activateUser.mutate(user.id)
    }
  }

  const isAnyProcessing = approveUser.isPending || deactivateUser.isPending || suspendUser.isPending || activateUser.isPending


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
    <div className="min-h-screen bg-[#070c1e] text-white p-4 sm:p-6 md:p-10 font-sans selection:bg-emerald-500/30 space-y-5 sm:space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5 mb-2 sm:mb-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)} 
            className="rounded-full border border-white/5 bg-[#0f1630] text-zinc-400 hover:text-emerald-400 hover:bg-[#102a24] transition-all duration-300 shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-emerald-400 bg-clip-text text-transparent truncate leading-normal">User Management</h1>
            <p className="text-xs text-zinc-400 mt-0.5 truncate font-medium">View and manage all registered accounts.</p>
          </div>
        </div>
        <Button 
          className="rounded-xl h-11 px-5 text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] w-full sm:w-auto shrink-0 transition-all active:scale-[0.98]"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <UserPlus className="mr-2 h-4 w-4 stroke-[2.5]" />
          Create Staff
        </Button>
      </div>

      {/* Main Container Card Module */}
      <Card className="border border-white/5 bg-[#0f1630] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-emerald-500/20 hover:shadow-[0_0_25px_rgba(16,185,129,0.08)] mt-2">
        <CardHeader className="p-3 sm:p-4 border-b border-white/5 bg-[#0b1026]">
          <div className="flex flex-col lg:flex-row gap-3 justify-between items-center w-full">
            <div className="relative w-full lg:w-80 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
              <Input 
                placeholder="Search by name, email, or ID..." 
                className="pl-9 h-9 rounded-lg bg-[#141d3d] border border-white/5 text-xs text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-emerald-500/50 transition-all duration-300 w-full" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5 w-full lg:w-auto sm:flex items-center">
              <div className="relative w-full">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 px-3 bg-[#141d3d] border border-white/5 rounded-lg text-[11px] font-bold text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all cursor-pointer w-full sm:min-w-[120px] appearance-none"
                >
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="PENDING">Pending</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="DEACTIVATED">Deactivated</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
                  <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>

              <div className="relative w-full">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="h-9 px-3 bg-[#141d3d] border border-white/5 rounded-lg text-[11px] font-bold text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all cursor-pointer w-full sm:min-w-[110px] appearance-none"
                >
                  <option value="">All Roles</option>
                  <option value="CUSTOMER">Customer</option>
                  <option value="WORKER">Worker</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
                  <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 bg-[#0f1630]">
          
          {/* Desktop & Tablet Table (Tight spaces to hold layout content cleanly) */}
          <div className="hidden md:block overflow-x-auto w-full">
            <table className="w-full border-collapse table-auto">
              <thead className="text-[10px] text-zinc-400 uppercase tracking-wider bg-[#0b1026]/60 border-b border-white/5">
                <tr>
                  <th className="px-3 py-3 font-bold text-left w-[30%]">User</th>
                  <th className="px-3 py-3 font-bold text-left w-[12%]">Role</th>
                  <th className="px-3 py-3 font-bold text-left w-[15%]">Status</th>
                  <th className="px-3 py-3 font-bold text-left w-[18%]">Joined</th>
                  <th className="px-3 py-3 font-bold text-right w-[25%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[11px] sm:text-xs">
                {isLoading ? (
                  [1, 2, 3, 4, 5].map(i => (
                    <tr key={i} className="animate-pulse bg-[#0f1630]">
                      <td colSpan={5} className="px-3 py-4">
                        <div className="h-8 bg-[#162045] rounded-md" />
                      </td>
                    </tr>
                  ))
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="group hover:bg-[#131c3d]/60 transition-all duration-300 ease-out">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 transition-transform group-hover:scale-105">
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors truncate">{user.fullName}</p>
                            <p className="text-[10px] text-zinc-500 font-semibold mt-0.5 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <Badge variant="outline" className="font-black uppercase text-[8px] tracking-wider border-white/10 bg-white/5 text-zinc-400 px-1.5 py-0.2 rounded">
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <Badge 
                          variant={getStatusVariant(user.status)}
                          className={cn(
                            "text-[9px] uppercase tracking-wider font-extrabold border-none px-2 py-0.5 rounded-md shadow-xs",
                            user.status === 'ACTIVE' && "bg-emerald-500/10 text-emerald-400",
                            user.status === 'PENDING' && "bg-amber-500/10 text-amber-400",
                            user.status === 'SUSPENDED' && "bg-red-500/10 text-red-400",
                            user.status === 'DEACTIVATED' && "bg-zinc-700 text-zinc-300"
                          )}
                        >
                          {user.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 font-semibold text-zinc-400 whitespace-nowrap">
                        {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-3 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 rounded-md text-blue-400 hover:bg-blue-500/10 p-0 shrink-0"
                            onClick={() => setSelectedUser(user)}
                            title="View Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>

                          {user.status === 'PENDING' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 rounded-md text-emerald-400 hover:bg-emerald-500/10 p-0 shrink-0"
                              onClick={() => handleApprove(user.id)}
                              disabled={isAnyProcessing}
                              title="Approve User"
                            >
                              <ShieldCheck className="h-3.5 w-3.5" />
                            </Button>
                          )}

                          {user.status !== 'DEACTIVATED' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={cn(
                                "h-7 w-7 rounded-md p-0 shrink-0 transition-colors",
                                user.status === 'ACTIVE' ? "text-amber-400 hover:bg-amber-500/10" : "text-emerald-400 hover:bg-emerald-500/10"
                              )}
                              onClick={() => handleToggleStatus(user)}
                              disabled={isAnyProcessing}
                              title={user.status === 'ACTIVE' ? "Suspend User" : "Activate User"}
                            >
                              {(suspendUser.isPending || activateUser.isPending) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : (
                                user.status === 'ACTIVE' ? <UserMinus className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          )}

                          <WalletLockAction userId={user.id} disabled={isAnyProcessing} />

                          {user.status !== 'DEACTIVATED' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 rounded-md text-red-400 hover:bg-red-500/10 p-0 shrink-0"
                              onClick={() => handleDeactivate(user.id)}
                              disabled={isAnyProcessing}
                              title="Deactivate User"
                            >
                              <ShieldAlert className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-3 py-16 text-center bg-[#0f1630]">
                      <Users className="h-10 w-10 text-zinc-500 mx-auto mb-3 animate-pulse" />
                      <h3 className="text-xs font-bold text-zinc-400 tracking-tight">No users found</h3>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Structured Card Feed Layout View */}
          <div className="block md:hidden divide-y divide-white/5 px-3 bg-[#0f1630]">
            {isLoading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="py-3 animate-pulse">
                  <div className="h-20 bg-[#162045] rounded-lg" />
                </div>
              ))
            ) : users.length > 0 ? (
              users.map((user) => (
                <div key={user.id} className="py-3.5 space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8.5 w-8.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-zinc-200 text-xs truncate leading-none">{user.fullName}</p>
                        <p className="text-[10px] text-zinc-500 font-semibold mt-1 leading-none truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col gap-1 items-end">
                      <Badge variant={getStatusVariant(user.status)} className={cn(
                        "text-[8px] font-extrabold h-4 px-1.5 rounded shadow-none border-none uppercase tracking-wide shrink-0",
                        user.status === 'ACTIVE' && "bg-emerald-500/10 text-emerald-400",
                        user.status === 'PENDING' && "bg-amber-500/10 text-amber-400",
                        user.status === 'SUSPENDED' && "bg-red-500/10 text-red-400",
                        user.status === 'DEACTIVATED' && "bg-zinc-700 text-zinc-300"
                      )}>
                        {user.status}
                      </Badge>
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{user.role}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1.5 border-t border-dashed border-white/5 bg-[#0f1630]">
                    <span className="text-[9px] text-zinc-500 font-bold leading-none">
                      Joined: {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 rounded-lg text-blue-400 bg-[#141d3d] border border-white/5 active:bg-[#1c2957]"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>

                      {user.status === 'PENDING' && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 rounded-lg text-emerald-400 bg-[#141d3d] border border-white/5 active:bg-[#1c2957]"
                          onClick={() => handleApprove(user.id)}
                          disabled={isAnyProcessing}
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                        </Button>
                      )}

                      {user.status !== 'DEACTIVATED' && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={cn(
                            "h-7 w-7 rounded-lg border border-white/5 active:bg-[#1c2957]",
                            user.status === 'ACTIVE' ? "text-amber-400" : "text-emerald-400"
                          )}
                          onClick={() => handleToggleStatus(user)}
                          disabled={isAnyProcessing}
                        >
                          {(suspendUser.isPending || activateUser.isPending) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : (
                            user.status === 'ACTIVE' ? <UserMinus className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      )}

                      <WalletLockAction userId={user.id} disabled={isAnyProcessing} className="bg-[#141d3d] border-white/5 active:bg-[#1c2957]" />

                      {user.status !== 'DEACTIVATED' && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 rounded-lg text-red-400 bg-[#141d3d] border border-white/5 active:bg-[#1c2957]"
                          onClick={() => handleDeactivate(user.id)}
                          disabled={isAnyProcessing}
                        >
                          <ShieldAlert className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-[#0f1630]">
                <Users className="h-9 w-9 text-zinc-500 mx-auto mb-2 animate-pulse" />
                <h3 className="text-xs font-bold text-zinc-400 tracking-tight">No users found</h3>
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-3 border-t border-white/5 bg-[#0b1026]/40 gap-3 w-full">
              <p className="text-[11px] text-zinc-400 font-bold order-2 sm:order-1 text-center sm:text-left">
                Page <span className="text-emerald-400 font-black">{page}</span> of <span className="text-white font-black">{totalPages}</span>
              </p>
              <div className="flex items-center gap-1.5 justify-between w-full sm:w-auto order-1 sm:order-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-white/5 bg-[#141d3d] hover:bg-[#1c2957] text-white text-[11px] font-bold h-8 disabled:opacity-40 transition-colors duration-300 flex-1 sm:flex-initial justify-center"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border border-white/5 bg-[#141d3d] hover:bg-[#1c2957] text-white text-[11px] font-bold h-8 disabled:opacity-40 transition-colors duration-300 flex-1 sm:flex-initial justify-center"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Details Overlay Modal Panel (70% Height, Centered, Scrollable Content Area) */}
      {selectedUser && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedUser(null)}
        >
          <Card 
            className="w-full max-w-lg h-[70vh] flex flex-col overflow-hidden border border-white/10 bg-[#0f1630] text-white rounded-2xl shadow-2xl shadow-black/80 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Area */}
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 bg-[#0b1026] p-4 shrink-0">
              <h3 className="font-bold text-sm sm:text-base text-zinc-200 tracking-tight">User Profile Summary</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSelectedUser(null)} 
                className="p-1 rounded-lg bg-white/5 border border-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 h-7 w-7 outline-none"
              >
                <svg width="14" height="14" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
              </Button>
            </CardHeader>
            
            {/* Modal Body Area (Scrollable within bounds) */}
            <CardContent className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 sm:space-y-5 scrollbar-thin scrollbar-thumb-white/10">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.15)] flex items-center justify-center text-xl sm:text-2xl font-black shrink-0">
                  {selectedUser.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm sm:text-base font-bold tracking-tight text-white truncate">{selectedUser.fullName}</h4>
                  <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 truncate font-medium">{selectedUser.email}</p>
                </div>
                <div className="flex gap-1.5">
                  <Badge 
                    variant={getStatusVariant(selectedUser.status)}
                    className={cn(
                      "text-[8px] sm:text-[9px] uppercase tracking-wider font-extrabold border-none px-2 py-0.5 rounded shrink-0",
                      selectedUser.status === 'ACTIVE' && "bg-emerald-500/10 text-emerald-400",
                      selectedUser.status === 'PENDING' && "bg-amber-500/10 text-amber-400",
                      selectedUser.status === 'SUSPENDED' && "bg-red-500/10 text-red-400",
                      selectedUser.status === 'DEACTIVATED' && "bg-zinc-700 text-zinc-300"
                    )}
                  >
                    {selectedUser.status}
                  </Badge>
                  <Badge variant="outline" className="font-extrabold uppercase text-[8px] sm:text-[9px] tracking-wider border-white/10 bg-white/5 text-zinc-300 px-2 py-0.5 rounded shrink-0">
                    {selectedUser.role}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-y border-white/5 py-3.5 text-xs">
                <div className="p-3 rounded-xl bg-[#141d3d] border border-white/5 space-y-0.5 min-w-0">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">User ID</p>
                  <p className="font-mono font-bold text-zinc-200 select-all truncate text-xs">#{selectedUser.id.toUpperCase()}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#141d3d] border border-white/5 space-y-0.5 min-w-0">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Phone</p>
                  <p className="font-bold text-zinc-200 truncate text-xs">{selectedUser.phone || 'N/A'}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#141d3d] border border-white/5 space-y-0.5 min-w-0">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Joined Date</p>
                  <p className="font-bold text-zinc-200 text-xs">{format(new Date(selectedUser.createdAt), 'MMM dd, yyyy')}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#141d3d] border border-white/5 space-y-0.5 min-w-0">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Last Sync</p>
                  <p className="font-bold text-zinc-200 text-xs">{format(new Date(selectedUser.updatedAt), 'MMM dd, yyyy')}</p>
                </div>
              </div>

              <WalletDetailsCard userId={selectedUser.id} />
            </CardContent>

            {/* Modal Actions Footer Area */}
            <CardContent className="p-4 border-t border-white/5 bg-[#0b1026] shrink-0 m-0">
              <div className={cn("grid gap-2 w-full", selectedUser.role === 'ADMIN' ? "grid-cols-2" : "grid-cols-3")}>
                <Button 
                  variant="outline" 
                  className="rounded-xl w-full h-10 border border-white/5 bg-[#141d3d] hover:bg-[#1c2957] text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors duration-300" 
                  onClick={() => setSelectedUser(null)}
                >
                  Close
                </Button>
                <Button 
                  variant="outline" 
                  className="rounded-xl w-full h-10 border border-white/5 bg-[#141d3d] hover:bg-[#1c2957] text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors duration-300"
                  onClick={() => navigate(`/admin/wallets/${selectedUser.id}`)}
                >
                  <Wallet className="mr-1 h-3.5 w-3.5 text-emerald-400" />
                  Wallet
                </Button>
                {selectedUser.role === 'CUSTOMER' && (
                  <Button 
                    className="rounded-xl w-full h-10 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300"
                    onClick={() => navigate(`/admin/wallets/${selectedUser.id}`)}
                  >
                    <Eye className="mr-1 h-3.5 w-3.5" />
                    Ledger
                  </Button>
                )}
                {selectedUser.role === 'WORKER' && (
                  <Button 
                    className="rounded-xl w-full h-10 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300"
                    onClick={() => navigate(`/admin/wallets/${selectedUser.id}`)}
                  >
                    <History className="mr-1 h-3.5 w-3.5" />
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
        onSuccess={() => {}}
      />
    </div>
  )
}

















