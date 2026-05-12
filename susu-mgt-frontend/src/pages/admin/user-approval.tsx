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
  Phone
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { usersService } from '@/services/api/users.service'
import { User } from '@/store/auth-store'
import { format } from 'date-fns'

export function UserApprovalPage() {
  const navigate = useNavigate()
  const [pendingUsers, setPendingUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const [remarks, setRemarks] = useState<string>('')

  useEffect(() => {
    fetchPendingUsers()
  }, [])

  const fetchPendingUsers = async () => {
    try {
      setIsLoading(true)
      const data = await usersService.getAllUsers({ limit: 100 }) // Simple fetch all for now
      setPendingUsers(data.data.filter(u => u.status === 'PENDING'))
    } catch (err) {
      console.error('Error fetching pending users:', err)
    } finally {
      setIsLoading(false)
    }
  }

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
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">User Approvals</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Review and approve new account registrations.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="warning" className="h-6 px-3 rounded-full">{pendingUsers.length} Pending</Badge>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="p-4 md:p-6 border-b dark:border-zinc-800">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input placeholder="Search pending users..." className="pl-10 h-11 rounded-full" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-50/50 dark:bg-zinc-900/50 border-b dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 font-bold">User Information</th>
                    <th className="px-6 py-4 font-bold">Registration Date</th>
                    <th className="px-6 py-4 font-bold">Role</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-zinc-800">
                  {isLoading ? (
                    [1, 2, 3].map(i => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={4} className="px-6 py-8">
                          <div className="h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl" />
                        </td>
                      </tr>
                    ))
                  ) : pendingUsers.length > 0 ? (
                    pendingUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg">
                              {user.fullName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-extrabold text-zinc-900 dark:text-zinc-100">{user.fullName}</p>
                              <div className="flex flex-col gap-0.5 mt-1">
                                <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                                  <Mail className="h-3 w-3" />
                                  {user.email}
                                </p>
                                {user.phone && (
                                  <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                                    <Phone className="h-3 w-3" />
                                    {user.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">{format(new Date(user.createdAt), 'MMM dd, yyyy')}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <Badge variant="outline" className="font-bold border-zinc-200 dark:border-zinc-700">
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10 rounded-xl"
                              onClick={() => handleReject(user.id)}
                              disabled={isProcessing === user.id}
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl h-9"
                              onClick={() => handleApprove(user.id)}
                              disabled={isProcessing === user.id}
                            >
                              {isProcessing === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />
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
                      <td colSpan={4} className="px-6 py-24 text-center">
                        <CheckCircle2 className="h-12 w-12 text-emerald-100 dark:text-emerald-900/30 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">All Caught Up!</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">No pending user registrations at the moment.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="p-8 rounded-[2rem] bg-blue-600 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="relative z-10 max-w-xl text-center md:text-left">
          <h2 className="text-2xl font-bold mb-2">Automated Verification?</h2>
          <p className="text-blue-100">
            Consider enabling auto-approval for users with verified phone numbers in the system settings.
          </p>
        </div>
        <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-full px-8 relative z-10">
          Go to Settings
        </Button>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
      </div>
    </div>
  )
}
