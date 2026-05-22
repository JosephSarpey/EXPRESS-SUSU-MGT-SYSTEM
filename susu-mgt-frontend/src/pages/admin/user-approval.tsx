


import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  UserCheck, 
  UserX, 
  Clock, 
  Search, 
  Loader2,
  CheckCircle2,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { usersService } from '@/services/api/users.service'
import { User } from '@/store/auth-store'
import { format } from 'date-fns'
import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'

export function UserApprovalPage() {
  const navigate = useNavigate()
  const [pendingUsers, setPendingUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [remarks, setRemarks] = useState<string>('')

  const debouncedSearch = useDebounce(search, 300)

  // Reset page to 1 on search change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  useEffect(() => {
    fetchPendingUsers()
  }, [page, limit, debouncedSearch])

  const fetchPendingUsers = async () => {
    try {
      setIsLoading(true)
      const data = await usersService.getAllUsers({ 
        page, 
        limit, 
        status: 'PENDING',
        search: debouncedSearch || undefined
      })
      setPendingUsers(data.data)
      setTotal(data.meta?.total || 0)
    } catch (err) {
      console.error('Error fetching pending users:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const totalPages = Math.ceil(total / limit)

  const handleApprove = async (id: string) => {
    try {
      setIsProcessing(id)
      await usersService.approveUser(id, remarks || 'Account approved by admin')
      setPendingUsers(users => users.filter(u => u.id !== id))
      setRemarks('')
    } catch (err) {
      console.error('Error approving user:', err)
    } finally {
      setIsProcessing(null)
    }
  }

  const handleReject = async (id: string) => {
    try {
      setIsProcessing(id)
      await usersService.deactivateUser(id) // Use deactivate as rejection for now
      setPendingUsers(users => users.filter(u => u.id !== id))
    } catch (err) {
      console.error('Error rejecting user:', err)
    } finally {
      setIsProcessing(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#070c1e] text-white p-6 md:p-10 font-sans selection:bg-emerald-500/30 space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
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
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">User Approvals</h1>
            <p className="text-xs text-zinc-400 mt-1">Review and approve new account registrations.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="text-[10px] uppercase tracking-wider font-extrabold border-none px-3 py-1 rounded-full bg-amber-500/10 text-amber-400">{total} Pending</Badge>
        </div>
      </div>

      <div className="grid gap-6 mt-4">
        <Card className="border border-white/5 bg-[#0f1630] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-emerald-500/20 hover:shadow-[0_0_25px_rgba(16,185,129,0.08)]">
          <CardHeader className="p-4 md:p-6 border-b border-white/5 bg-[#0b1026]">
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
              <Input 
                placeholder="Search pending users..." 
                className="pl-11 h-11 rounded-xl bg-[#141d3d] border border-white/5 text-sm text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-emerald-500/50 transition-all duration-300" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="text-[11px] text-zinc-400 uppercase tracking-widest bg-[#0b1026]/60 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-5 font-bold">User Information</th>
                    <th className="px-6 py-5 font-bold">Registration Date</th>
                    <th className="px-6 py-5 font-bold">Role</th>
                    <th className="px-6 py-5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoading ? (
                    [1, 2, 3].map(i => (
                      <tr key={i} className="animate-pulse bg-[#0f1630]">
                        <td colSpan={4} className="px-6 py-6">
                          <div className="h-12 bg-[#162045] rounded-xl" />
                        </td>
                      </tr>
                    ))
                  ) : pendingUsers.length > 0 ? (
                    pendingUsers.map((user) => (
                      <tr key={user.id} className="group hover:bg-[#131c3d]/60 transition-all duration-300 ease-out">
                        <td className="px-6 py-5.5">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-extrabold group-hover:scale-105 group-hover:border-emerald-500/30 group-hover:text-emerald-400 transition-all duration-300 text-lg">
                              {user.fullName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-zinc-200 group-hover:text-white transition-colors">{user.fullName}</p>
                              <div className="flex flex-col gap-0.5 mt-1">
                                <p className="text-xs text-zinc-500 font-medium flex items-center gap-1.5">
                                  <Mail className="h-3 w-3 text-zinc-600" />
                                  {user.email}
                                </p>
                                {user.phone && (
                                  <p className="text-xs text-zinc-500 font-medium flex items-center gap-1.5">
                                    <Phone className="h-3 w-3 text-zinc-600" />
                                    {user.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5.5">
                          <div className="flex items-center gap-2 text-zinc-400 text-xs">
                            <Clock className="h-4 w-4 text-zinc-500" />
                            <span className="font-semibold">{format(new Date(user.createdAt), 'MMM dd, yyyy')}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5.5">
                          <Badge variant="outline" className="font-extrabold uppercase text-[9px] tracking-wider border-white/10 bg-white/5 text-zinc-300 px-2 py-0.5 rounded-full">
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-5.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8.5 rounded-lg text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-300"
                              onClick={() => handleReject(user.id)}
                              disabled={isProcessing === user.id}
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl h-8.5 transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]"
                              onClick={() => handleApprove(user.id)}
                              disabled={isProcessing === user.id}
                            >
                              {isProcessing === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <UserCheck className="mr-1.5 h-4 w-4" />
                                  Approve
                                </>
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-24 text-center bg-[#0f1630]">
                        <CheckCircle2 className="h-12 w-12 text-emerald-400/20 mx-auto mb-4 animate-pulse" />
                        <h3 className="text-base font-bold text-zinc-300 mb-1">All Caught Up!</h3>
                        <p className="text-xs text-zinc-500 max-w-xs mx-auto">No pending user registrations at the moment.</p>
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
      </div>

      <div className="p-8 rounded-2xl bg-gradient-to-br from-[#111a36] to-[#0c1229] border border-white/5 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl transition-all duration-300 hover:border-emerald-500/20 group">
        <div className="relative z-10 max-w-xl text-center md:text-left">
          <h2 className="text-xl font-bold mb-2 group-hover:text-emerald-400 transition-colors duration-300">Automated Verification?</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Consider enabling auto-approval for users with verified phone numbers in the system settings.
          </p>
        </div>
        <Button variant="outline" className="bg-[#141d3d] hover:bg-[#1c2957] border border-white/5 text-zinc-200 hover:text-white rounded-xl px-6 relative z-10 transition-colors duration-300">
          Go to Settings
        </Button>
        <div className="absolute -right-24 -top-24 h-48 w-48 bg-emerald-500/5 group-hover:bg-emerald-500/10 blur-xl rounded-full transition-colors duration-500" />
      </div>
    </div>
  )
}
