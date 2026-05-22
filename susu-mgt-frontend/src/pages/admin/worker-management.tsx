
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
    <div className="min-h-screen bg-[#070c1e] text-white p-6 md:p-10 font-sans selection:bg-emerald-500/30 space-y-8 pb-12 animate-in fade-in duration-500">
      
      {/* Page Header block */}
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
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Worker Management</h1>
            <p className="text-xs text-zinc-400 mt-1">Monitor active worker sessions and activities.</p>
          </div>
        </div>
      </div>

      {/* Custom Sliding Segmented Tabs Header */}
      <div className="flex gap-6 border-b border-white/5 pt-2">
        <button
          className={cn(
            "pb-3 font-semibold text-xs tracking-wider uppercase border-b-2 transition-all duration-300",
            activeTab === 'sessions'
              ? "border-emerald-400 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
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
            "pb-3 font-semibold text-xs tracking-wider uppercase border-b-2 transition-all duration-300",
            activeTab === 'collections'
              ? "border-emerald-400 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          )}
          onClick={() => setActiveTab('collections')}
        >
          <div className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Collections History
          </div>
        </button>
      </div>

      {/* Main Container Card */}
      <Card className="border border-white/5 bg-[#0f1630] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-emerald-500/20 hover:shadow-[0_0_25px_rgba(16,185,129,0.08)] mt-4">
        <CardHeader className="p-4 md:p-6 border-b border-white/5 bg-[#0b1026]">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
              <Input
                placeholder="Search..."
                className="pl-11 h-11 rounded-xl bg-[#141d3d] border border-white/5 text-sm text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-emerald-500/50 transition-all duration-300"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {activeTab === 'sessions' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                {/* Header columns spacing adjustments */}
                <thead className="text-[11px] text-zinc-400 uppercase tracking-widest bg-[#0b1026]/60 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-5 font-bold">Worker</th>
                    <th className="px-6 py-5 font-bold">Status</th>
                    <th className="px-6 py-5 font-bold">Clock In</th>
                    <th className="px-6 py-5 font-bold">Clock Out</th>
                    <th className="px-6 py-5 font-bold">IP Address</th>
                    <th className="px-6 py-5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoading ? (
                    [1, 2, 3].map(i => (
                      <tr key={i} className="animate-pulse bg-[#0f1630]">
                        <td colSpan={6} className="px-6 py-6">
                          <div className="h-10 bg-[#162045] rounded-xl" />
                        </td>
                      </tr>
                    ))
                  ) : sessions.length > 0 ? (
                    sessions.map((session) => (
                      <tr key={session.id} className="group hover:bg-[#131c3d]/60 transition-all duration-300 ease-out">
                        {/* py-5.5 increases the space inside cell blocks making row components clearer to isolate visually */}
                        <td className="px-6 py-7">
                          <div className="flex items-center gap-3.5">
                            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold group-hover:scale-105 group-hover:border-emerald-500/30 group-hover:text-emerald-400 transition-all duration-300">
                              {session.worker?.fullName?.charAt(0) || 'W'}
                            </div>
                            <div>
                              <p className="font-bold text-zinc-200 group-hover:text-white transition-colors">{session.worker?.fullName || 'Unknown'}</p>
                              <p className="text-xs text-zinc-500 font-medium">ID: {session.workerId?.slice(0, 8).toUpperCase()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5.5">
                          <Badge 
                            variant={session.status === 'ACTIVE' ? 'success' : 'secondary'}
                            className={cn(
                              "text-[10px] uppercase tracking-wider font-extrabold border-none px-2.5 py-0.5 rounded-full",
                              session.status === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-700 text-zinc-300"
                            )}
                          >
                            {session.status || 'ACTIVE'}
                          </Badge>
                        </td>
                        <td className="px-6 py-5.5 text-xs text-zinc-400">
                          {session.loginTime ? format(new Date(session.loginTime), 'MMM dd, HH:mm') : 'N/A'}
                        </td>
                        <td className="px-6 py-5.5 text-xs font-semibold text-zinc-400">
                          {session.logoutTime ? format(new Date(session.logoutTime), 'MMM dd, HH:mm') : (session.status === 'ACTIVE' ? <span className="text-blue-400">Ongoing</span> : 'N/A')}
                        </td>
                        <td className="px-6 py-5.5 text-xs text-zinc-400">
                          {session.ipAddress || 'Unknown'}
                        </td>
                        <td className="px-6 py-5.5 text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg text-blue-400 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 transition-all duration-300"
                              onClick={() => setSelectedSession(session)}
                              title="View Details"
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                            {session.status === 'ACTIVE' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-300"
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
                      <td colSpan={6} className="px-6 py-24 text-center bg-[#0f1630]">
                        <Users className="h-12 w-12 text-zinc-700 mx-auto mb-4 animate-pulse" />
                        <h3 className="text-base font-bold text-zinc-300">No sessions found</h3>
                        <p className="text-xs text-zinc-500 mt-0.5">There are no operational backend worker nodes detected.</p>
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

      {/* Profiles Modal Overlays overlay */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <Card className="w-full max-w-lg overflow-hidden border border-white/10 bg-[#0f1630] text-white rounded-2xl shadow-2xl shadow-black/80">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 bg-[#0b1026] p-4.5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  <Monitor className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-zinc-200 tracking-wide">Session Details</h3>
                  <p className="text-[10px] uppercase tracking-widest font-black text-zinc-500 mt-0.5">ID: {selectedSession.id.slice(0, 12).toUpperCase()}...</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSelectedSession(null)} 
                className="rounded-full h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
              </Button>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-[#161f3d] to-[#0c1229] border border-white/5">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-xl font-black">
                  {selectedSession.worker?.fullName?.charAt(0) || 'W'}
                </div>
                <div>
                  <p className="font-bold text-white text-base">{selectedSession.worker?.fullName || 'Unknown Worker'}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{selectedSession.worker?.email || 'No email associated'}</p>
                </div>
                <Badge 
                  className={cn(
                    "ml-auto text-[10px] uppercase tracking-wider font-extrabold border-none px-2.5 py-0.5 rounded-full",
                    selectedSession.status === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-700 text-zinc-300"
                  )} 
                  variant={selectedSession.status === 'ACTIVE' ? 'success' : 'secondary'}
                >
                  {selectedSession.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs border-y border-white/5 py-4">
                <div className="space-y-1">
                  <p className="font-semibold text-zinc-500 uppercase tracking-wider">Clock In</p>
                  <p className="font-bold text-zinc-200">
                    {selectedSession.loginTime ? format(new Date(selectedSession.loginTime), 'PPP p') : 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-zinc-500 uppercase tracking-wider">Clock Out</p>
                  <p className="font-bold text-zinc-200">
                    {selectedSession.logoutTime ? format(new Date(selectedSession.logoutTime), 'PPP p') : (selectedSession.status === 'ACTIVE' ? 'Still active' : 'N/A')}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-zinc-500 uppercase tracking-wider">IP Address</p>
                  <p className="font-bold text-zinc-200">{selectedSession.ipAddress || 'Unknown'}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-zinc-500 uppercase tracking-wider">Device Cluster</p>
                  <p className="font-bold text-zinc-200 truncate" title={selectedSession.deviceInfo}>
                    {selectedSession.deviceInfo || 'Unknown Device'}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Button className="w-full rounded-xl border border-white/5 bg-[#141d3d] hover:bg-[#1c2957] text-zinc-300 hover:text-white transition-colors duration-300" variant="outline" onClick={() => setSelectedSession(null)}>
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





