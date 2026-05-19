import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Search,
  Users,
  PowerOff,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Clock,
  History,
  Monitor,
  Info
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { adminService } from '@/services/api/admin.service'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { WorkerCollectionsTab } from '@/components/admin/worker-collections-tab'
import { useDebounce } from '@/hooks/use-debounce'

export function WorkerManagementPage() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'sessions' | 'collections'>('sessions')
  const [selectedSession, setSelectedSession] = useState<any | null>(null)

  const debouncedSearch = useDebounce(search, 300)

  // Reset page to 1 on search change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  useEffect(() => {
    if (activeTab === 'sessions') {
      fetchSessions()
    }
  }, [page, limit, activeTab, debouncedSearch])

  const fetchSessions = async () => {
    try {
      setIsLoading(true)
      const res = await adminService.getWorkerSessions({ 
        page, 
        limit,
        search: debouncedSearch || undefined
      })
      setSessions(res.data || [])
      setTotal(res.meta?.total || 0)
    } catch (err) {
      console.error('Error fetching worker sessions:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTerminate = async (sessionId: string) => {
    try {
      setIsProcessing(sessionId)
      await adminService.terminateWorkerSession(sessionId)
      await fetchSessions()
    } catch (err) {
      console.error('Error terminating session:', err)
    } finally {
      setIsProcessing(null)
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">Worker Management</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Monitor active worker sessions and activities.</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 border-b dark:border-zinc-800">
        <button
          className={cn(
            "pb-3 font-medium text-sm border-b-2 transition-colors",
            activeTab === 'sessions'
              ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
              : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
          )}
          onClick={() => setActiveTab('sessions')}
        >
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Active Sessions
          </div>
        </button>
        <button
          className={cn(
            "pb-3 font-medium text-sm border-b-2 transition-colors",
            activeTab === 'collections'
              ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
              : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
          )}
          onClick={() => setActiveTab('collections')}
        >
          <div className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Collections History
          </div>
        </button>
      </div>

      <Card>
        <CardHeader className="p-4 md:p-6 border-b dark:border-zinc-800">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search..."
                className="pl-10 h-10 rounded-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {activeTab === 'sessions' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-50/50 dark:bg-zinc-900/50 border-b dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 font-bold">Worker</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold">Clock In</th>
                    <th className="px-6 py-4 font-bold">Clock Out</th>
                    <th className="px-6 py-4 font-bold">IP Address</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-zinc-800">
                  {isLoading ? (
                    [1, 2, 3].map(i => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={5} className="px-6 py-4">
                          <div className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
                        </td>
                      </tr>
                    ))
                  ) : sessions.length > 0 ? (
                    sessions.map((session) => (
                      <tr key={session.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center font-bold">
                              {session.worker?.fullName?.charAt(0) || 'W'}
                            </div>
                            <div>
                              <p className="font-bold text-zinc-900 dark:text-zinc-100">{session.worker?.fullName || 'Unknown'}</p>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400">ID: {session.workerId?.slice(0, 8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={session.status === 'ACTIVE' ? 'success' : 'secondary'}>
                            {session.status || 'ACTIVE'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                          {session.loginTime ? format(new Date(session.loginTime), 'MMM dd, HH:mm') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                          {session.logoutTime ? format(new Date(session.logoutTime), 'MMM dd, HH:mm') : (session.status === 'ACTIVE' ? 'Ongoing' : 'N/A')}
                        </td>
                        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                          {session.ipAddress || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                              onClick={() => setSelectedSession(session)}
                              title="View Details"
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                            {session.status === 'ACTIVE' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                onClick={() => handleTerminate(session.id)}
                                disabled={isProcessing === session.id}
                                title="Terminate Session"
                              >
                                {isProcessing === session.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <PowerOff className="h-4 w-4" />}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-24 text-center">
                        <Users className="h-12 w-12 text-zinc-200 dark:text-zinc-800 mx-auto mb-4" />
                        <p className="text-zinc-500 dark:text-zinc-400">No sessions found.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'collections' && (
            <div className="p-0">
              <WorkerCollectionsTab />
            </div>
          )}

          {totalPages > 1 && activeTab === 'sessions' && (
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

      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-lg">
            <CardHeader className="flex flex-row items-center justify-between border-b dark:border-zinc-800 p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center font-bold">
                  <Monitor className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Session Details</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">ID: {selectedSession.id}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedSession(null)} className="rounded-full">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border dark:border-zinc-800">
                <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
                  {selectedSession.worker?.fullName?.charAt(0) || 'W'}
                </div>
                <div>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">{selectedSession.worker?.fullName || 'Unknown Worker'}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{selectedSession.worker?.email || 'No email'}</p>
                </div>
                <Badge className="ml-auto" variant={selectedSession.status === 'ACTIVE' ? 'success' : 'secondary'}>
                  {selectedSession.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Clock In</p>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {selectedSession.loginTime ? format(new Date(selectedSession.loginTime), 'PPP p') : 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Clock Out</p>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {selectedSession.logoutTime ? format(new Date(selectedSession.logoutTime), 'PPP p') : (selectedSession.status === 'ACTIVE' ? 'Still active' : 'N/A')}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">IP Address</p>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{selectedSession.ipAddress || 'Unknown'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Device</p>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate" title={selectedSession.deviceInfo}>
                    {selectedSession.deviceInfo || 'Unknown Device'}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t dark:border-zinc-800">
                <Button className="w-full rounded-xl" variant="outline" onClick={() => setSelectedSession(null)}>
                  Close Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
