

import { useState } from 'react'
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
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { WorkerCollectionsTab } from '@/components/admin/worker-collections-tab'
import { useDebounce } from '@/hooks/use-debounce'
import { useAdminUIStore } from '@/store/admin-ui-store'
import { useWorkerSessions, useTerminateSession } from '@/hooks/use-admin'

export function WorkerManagementPage() {
  const navigate = useNavigate()
  
  const {
    search, setSearch,
    page, setPage,
    activeTab, setActiveTab,
    selectedSession, setSelectedSession
  } = useAdminUIStore((state) => state.workerManagement)

  const [limit] = useState(10)
  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading } = useWorkerSessions({
    page,
    limit,
    search: debouncedSearch || undefined
  })

  const sessions = data?.data || []
  const total = data?.meta?.total || 0
  const totalPages = Math.ceil(total / limit)

  const terminateSession = useTerminateSession()

  const handleTerminate = (sessionId: string) => {
    terminateSession.mutate(sessionId)
  }

  const isProcessing = terminateSession.isPending ? terminateSession.variables : null

  return (
    <div className="min-h-screen bg-[#070c1e] text-white p-4 sm:p-6 md:p-10 font-sans selection:bg-emerald-500/30 space-y-6 sm:space-y-8 pb-12 animate-in fade-in duration-500">
      
      {/* Page Header block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5 mb-4">
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
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-emerald-400 bg-clip-text text-transparent truncate leading-normal">Worker Management</h1>
            <p className="text-xs text-zinc-400 mt-0.5 truncate font-medium">Monitor active worker sessions and activities.</p>
          </div>
        </div>
      </div>

      {/* Custom Sliding Segmented Tabs Header */}
      <div className="flex gap-4 sm:gap-6 border-b border-white/5 pt-2">
        <button
          className={cn(
            "pb-3 font-semibold text-xs tracking-wider uppercase border-b-2 transition-all duration-300 outline-none",
            activeTab === 'sessions'
              ? "border-emerald-400 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          )}
          onClick={() => setActiveTab('sessions')}
        >
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Active Sessions</span>
          </div>
        </button>
        <button
          className={cn(
            "pb-3 font-semibold text-xs tracking-wider uppercase border-b-2 transition-all duration-300 outline-none",
            activeTab === 'collections'
              ? "border-emerald-400 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          )}
          onClick={() => setActiveTab('collections')}
        >
          <div className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span>Collections History</span>
          </div>
        </button>
      </div>

      {/* Main Container Card */}
      <Card className="border border-white/5 bg-[#0f1630] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-emerald-500/20 hover:shadow-[0_0_25px_rgba(16,185,129,0.08)] mt-4">
        <CardHeader className="p-4 sm:p-6 border-b border-white/5 bg-[#0b1026]">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center w-full">
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
              <Input
                placeholder="Search worker name or ID..."
                className="pl-11 h-11 rounded-xl bg-[#141d3d] border border-white/5 text-sm text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-emerald-500/50 transition-all duration-300 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 bg-[#0f1630]">
          {activeTab === 'sessions' && (
            <>
              {/* Desktop & Tablet Table View Layout (Contains all cells elegantly within screen layout without swapping) */}
              <div className="hidden md:block overflow-x-auto w-full">
                <table className="w-full text-sm text-left border-collapse table-auto">
                  <thead className="text-[11px] text-zinc-400 uppercase tracking-widest bg-[#0b1026]/60 border-b border-white/5">
                    <tr>
                      <th className="px-4 lg:px-6 py-5 font-bold min-w-[180px]">Worker</th>
                      <th className="px-4 lg:px-6 py-5 font-bold min-w-[90px]">Status</th>
                      <th className="px-4 lg:px-6 py-5 font-bold min-w-[110px]">Clock In</th>
                      <th className="px-4 lg:px-6 py-5 font-bold min-w-[110px]">Clock Out</th>
                      <th className="px-4 lg:px-6 py-5 font-bold min-w-[110px]">IP Address</th>
                      <th className="px-4 lg:px-6 py-5 font-bold text-right min-w-[90px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {isLoading ? (
                      [1, 2, 3].map(i => (
                        <tr key={i} className="animate-pulse bg-[#0f1630]">
                          <td colSpan={6} className="px-4 lg:px-6 py-6">
                            <div className="h-10 bg-[#162045] rounded-xl" />
                          </td>
                        </tr>
                      ))
                    ) : sessions.length > 0 ? (
                      sessions.map((session: any) => (
                        <tr key={session.id} className="group hover:bg-[#131c3d]/60 transition-all duration-300 ease-out">
                          <td className="px-4 lg:px-6 py-4.5">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 transition-transform group-hover:scale-105">
                                {session.worker?.fullName?.charAt(0).toUpperCase() || 'W'}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors text-sm truncate">{session.worker?.fullName || 'Unknown'}</p>
                                <p className="text-[11px] text-zinc-500 font-semibold mt-0.5 truncate">ID: {session.workerId?.slice(0, 8).toUpperCase()}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4.5 whitespace-nowrap">
                            <Badge 
                              variant={session.status === 'ACTIVE' ? 'success' : 'secondary'}
                              className={cn(
                                "text-[9px] uppercase tracking-wider font-extrabold border-none px-2.5 py-0.5 rounded-md",
                                session.status === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-700 text-zinc-300"
                              )}
                            >
                              {session.status || 'ACTIVE'}
                            </Badge>
                          </td>
                          <td className="px-4 lg:px-6 py-4.5 text-xs font-semibold text-zinc-400 whitespace-nowrap">
                            {session.loginTime ? format(new Date(session.loginTime), 'MMM dd, HH:mm') : 'N/A'}
                          </td>
                          <td className="px-4 lg:px-6 py-4.5 text-xs font-semibold text-zinc-400 whitespace-nowrap">
                            {session.logoutTime ? format(new Date(session.logoutTime), 'MMM dd, HH:mm') : (session.status === 'ACTIVE' ? <span className="text-blue-400 font-bold">Ongoing</span> : 'N/A')}
                          </td>
                          <td className="px-4 lg:px-6 py-4.5 text-xs font-semibold text-zinc-400 whitespace-nowrap">
                            {session.ipAddress || 'Unknown'}
                          </td>
                          <td className="px-4 lg:px-6 py-4.5 text-right whitespace-nowrap">
                            <div className="flex justify-end gap-1.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-blue-400 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 transition-all duration-300 shrink-0"
                                onClick={() => setSelectedSession(session)}
                                title="View Details"
                              >
                                <Info className="h-4 w-4" />
                              </Button>
                              {session.status === 'ACTIVE' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-lg text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-300 shrink-0"
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
                          <h3 className="text-sm font-bold text-zinc-300 tracking-tight">No sessions found</h3>
                          <p className="text-xs text-zinc-500 mt-1 font-medium">There are no operational backend worker nodes detected.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Structured Card Feed Layout View */}
              <div className="block md:hidden divide-y divide-white/5 px-4 bg-[#0f1630]">
                {isLoading ? (
                  [1, 2, 3].map(i => (
                    <div key={i} className="py-4 animate-pulse">
                      <div className="h-20 bg-[#162045] rounded-xl" />
                    </div>
                  ))
                ) : sessions.length > 0 ? (
                  sessions.map((session: any) => (
                    <div key={session.id} className="py-4.5 space-y-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
                            {session.worker?.fullName?.charAt(0).toUpperCase() || 'W'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-zinc-200 text-sm truncate leading-none">
                              {session.worker?.fullName || 'Unknown'}
                            </p>
                            <p className="text-[11px] text-zinc-500 font-semibold mt-1.5 leading-none truncate">
                              ID: {session.workerId?.slice(0, 8).toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0">
                          <Badge 
                            variant={session.status === 'ACTIVE' ? 'success' : 'secondary'}
                            className={cn(
                              "text-[8px] sm:text-[9px] font-extrabold h-4 px-1.5 rounded shadow-none border-none uppercase tracking-wide shrink-0",
                              session.status === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-700 text-zinc-300"
                            )}
                          >
                            {session.status || 'ACTIVE'}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-2 border-t border-dashed border-white/5 bg-[#0f1630]">
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="text-[10px] text-zinc-500 font-semibold leading-none">
                            In: {session.loginTime ? format(new Date(session.loginTime), 'MMM dd, HH:mm') : 'N/A'}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-semibold leading-none mt-1">
                            Out: {session.logoutTime ? format(new Date(session.logoutTime), 'MMM dd, HH:mm') : (session.status === 'ACTIVE' ? <span className="text-blue-400 font-bold">Ongoing</span> : 'N/A')}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-xl text-blue-400 bg-[#141d3d] border border-white/5 active:bg-[#1c2957]"
                            onClick={() => setSelectedSession(session)}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                          {session.status === 'ACTIVE' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-xl text-red-400 bg-[#141d3d] border border-white/5 active:bg-[#1c2957]"
                              onClick={() => handleTerminate(session.id)}
                              disabled={isProcessing === session.id}
                            >
                              {isProcessing === session.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <PowerOff className="h-4 w-4" />}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-[#0f1630]">
                    <Users className="h-10 w-10 text-zinc-500 mx-auto mb-3 animate-pulse" />
                    <h3 className="text-sm font-bold text-zinc-400 tracking-tight">No sessions found</h3>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'collections' && (
            <div className="p-0">
              <WorkerCollectionsTab />
            </div>
          )}

          {totalPages > 1 && activeTab === 'sessions' && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-white/5 bg-[#0b1026]/40 gap-4 w-full">
              <p className="text-xs text-zinc-400 font-bold order-2 sm:order-1 text-center sm:text-left">
                Page <span className="text-emerald-400 font-black">{page}</span> of <span className="text-white font-black">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2 justify-between w-full sm:w-auto order-1 sm:order-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="rounded-xl border border-white/5 bg-[#141d3d] hover:bg-[#1c2957] text-white text-xs font-bold disabled:opacity-40 transition-colors duration-300 flex-1 sm:flex-initial justify-center"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="rounded-xl border border-white/5 bg-[#141d3d] hover:bg-[#1c2957] text-white text-xs font-bold disabled:opacity-40 transition-colors duration-300 flex-1 sm:flex-initial justify-center"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Details Overlay Modal */}
      {selectedSession && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedSession(null)}
        >
          <Card 
            className="w-full max-w-lg overflow-hidden border border-white/10 bg-[#0f1630] text-white rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 bg-[#0b1026] p-5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Monitor className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-base sm:text-lg text-zinc-200 tracking-tight truncate">Session Details</h3>
                  <p className="text-[10px] text-zinc-500 font-mono tracking-wider truncate mt-0.5">ID: #{selectedSession.id.toUpperCase()}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSelectedSession(null)} 
                className="p-2 rounded-xl bg-white/5 border border-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 outline-none"
              >
                <XIcon />
              </Button>
            </CardHeader>
            
            <CardContent className="p-5 sm:p-6 space-y-5 sm:space-y-6">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 shadow-2xs w-full min-w-0">
                <div className="h-11 w-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md shadow-blue-500/10">
                  {selectedSession.worker?.fullName?.charAt(0).toUpperCase() || 'W'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-white text-sm sm:text-base truncate leading-none">{selectedSession.worker?.fullName || 'Unknown Worker'}</p>
                  <p className="text-xs text-zinc-400 truncate mt-1.5 font-medium leading-none">{selectedSession.worker?.email || 'No email associated'}</p>
                </div>
                <Badge 
                  className={cn(
                    "text-[9px] uppercase tracking-wider font-extrabold border-none px-2.5 py-0.5 rounded-md shrink-0 self-start sm:self-center",
                    selectedSession.status === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-700 text-zinc-300"
                  )} 
                  variant={selectedSession.status === 'ACTIVE' ? 'success' : 'secondary'}
                >
                  {selectedSession.status}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 border-y border-white/5 py-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#141d3d] border border-white/5 space-y-1 min-w-0">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Clock In</p>
                  <p className="font-bold text-zinc-200 leading-tight">
                    {selectedSession.loginTime ? format(new Date(selectedSession.loginTime), 'PPP p') : 'N/A'}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#141d3d] border border-white/5 space-y-1 min-w-0">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Clock Out</p>
                  <p className="font-bold text-zinc-200 leading-tight">
                    {selectedSession.logoutTime ? format(new Date(selectedSession.logoutTime), 'PPP p') : (selectedSession.status === 'ACTIVE' ? 'Still active' : 'N/A')}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#141d3d] border border-white/5 space-y-1 min-w-0">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">IP Address</p>
                  <p className="font-mono font-bold text-zinc-200">{selectedSession.ipAddress || 'Unknown'}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#141d3d] border border-white/5 space-y-1 min-w-0">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Device Cluster</p>
                  <p className="font-bold text-zinc-200 truncate leading-snug" title={selectedSession.deviceInfo}>
                    {selectedSession.deviceInfo || 'Unknown Device'}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Button className="w-full h-11 text-xs font-bold uppercase tracking-wider rounded-xl border border-white/5 bg-[#141d3d] hover:bg-[#1c2957] text-zinc-300 hover:text-white transition-colors duration-300" variant="outline" onClick={() => setSelectedSession(null)}>
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

function XIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
      <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
    </svg>
  )
}

