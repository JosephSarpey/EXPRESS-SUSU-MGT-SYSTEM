
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  Loader2,
  Power,
  Info
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { workersService } from '@/services/api/workers.service'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

export function ClockInOutPage() {
  const navigate = useNavigate()
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSession()
  }, [])

  const fetchSession = async () => {
    try {
      setIsLoading(true)
      const data = await workersService.getActiveSession()
      setSession(data)
    } catch (err) {
      console.error('Error fetching session:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClockToggle = async () => {
    try {
      setIsSubmitting(true)
      setError(null)
      
      if (session) {
        // Clock Out
        await workersService.clockOut()
        setSession(null)
      } else {
        // Clock In
        const data = await workersService.clockIn({
          deviceInfo: navigator.userAgent,
          ipAddress: 'detected-by-server'
        })
        setSession(data)
      }
    } catch (err: any) {
      console.error('Error toggling clock status:', err)
      setError(err.response?.data?.message || 'Failed to update status. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-[#070c1e] min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  const isClockedIn = !!session

  return (
    <div className="bg-[#070c1e] min-h-screen text-white p-6 md:p-10 font-sans selection:bg-emerald-500/30 animate-in fade-in duration-500">
      <div className="max-w-2xl mx-auto space-y-8 pb-12">
        
        {/* Header Section */}
        <div className="flex items-center gap-4 pb-6 border-b border-white/5">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)} 
            className="rounded-full border border-white/5 bg-[#0f1630] text-zinc-400 hover:text-emerald-400 hover:bg-[#141d3d] transition-all duration-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Attendance</h1>
            <p className="text-xs text-zinc-400 mt-1">Manage your work session and field availability.</p>
          </div>
        </div>

        <div className="grid gap-8">
          
          {/* Core Session Control Box */}
          <Card className={cn(
            "border bg-[#0f1630] text-white shadow-2xl rounded-2xl overflow-hidden transition-all duration-500",
            isClockedIn ? "border-emerald-500/20 shadow-[0_0_25px_rgba(16,185,129,0.05)]" : "border-white/5"
          )}>
            <CardHeader className="pt-6 px-6 md:px-8 pb-4 bg-[#0b1026] border-b border-white/5 relative">
              <div className={cn(
                "absolute top-0 left-0 bottom-0 w-1",
                isClockedIn ? "bg-emerald-400" : "bg-zinc-600"
              )} />
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold tracking-tight text-white">Session Status</CardTitle>
                  <CardDescription className="mt-0.5 text-xs font-medium text-zinc-400">
                    {isClockedIn ? 'Your session is active' : 'You are currently inactive'}
                  </CardDescription>
                </div>
                <div className={cn(
                  "h-11 w-11 rounded-xl flex items-center justify-center border shadow-2xs",
                  isClockedIn 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                    : "bg-[#141d3d] text-zinc-500 border-white/5"
                )}>
                  <Clock className="h-5 w-5 stroke-[2.2]" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 md:p-8 space-y-6 bg-[#0f1630]">
              <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed rounded-2xl border-white/5 bg-[#0b1026]/30">
                <div className={cn(
                  "h-28 w-28 rounded-full flex items-center justify-center shadow-2xl mb-5 relative group transition-all duration-300",
                  isClockedIn 
                    ? "bg-emerald-600 text-white shadow-emerald-500/10 hover:bg-emerald-500 hover:scale-102" 
                    : "bg-blue-600 text-white shadow-blue-500/10 hover:bg-blue-500 hover:scale-102"
                )}>
                  <button
                    onClick={handleClockToggle}
                    disabled={isSubmitting}
                    className="absolute inset-0 flex items-center justify-center rounded-full focus:outline-none"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-10 w-10 animate-spin" />
                    ) : (
                      <Power className="h-10 w-10" />
                    )}
                  </button>
                </div>
                <h3 className="text-base font-bold text-white tracking-tight mb-0.5">
                  {isClockedIn ? 'End Session' : 'Start Session'}
                </h3>
                <p className="text-xs text-zinc-400 font-medium">
                  {isClockedIn ? 'Click to clock out for the day' : 'Click to clock in and start working'}
                </p>
              </div>

              {isClockedIn && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="p-4 rounded-xl bg-[#0b1026]/40 border border-white/5">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Clock In Time</p>
                    <p className="text-base font-bold text-zinc-200 tracking-tight">
                      {(() => {
                        if (!session.loginTime) return 'N/A'
                        const date = new Date(session.loginTime)
                        return isNaN(date.getTime()) ? 'Invalid time' : format(date, 'hh:mm a')
                      })()}
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-2.5 text-red-400 animate-in fade-in duration-200">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 stroke-[2.5]" />
                  <p className="text-xs font-semibold leading-relaxed">{error}</p>
                </div>
              )}
            </CardContent>

            <CardFooter className="bg-[#0b1026]/40 border-t border-white/5 px-6 md:px-8 py-4 flex items-center gap-2.5">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-400 shrink-0 stroke-[2.2]" />
              <p className="text-[11px] font-medium text-zinc-400 leading-normal">
                Your location and device information are logged for security purposes.
              </p>
            </CardFooter>
          </Card>

          {/* Guidelines Note Banner */}
          <div className="p-5 rounded-2xl bg-[#0f1630] border border-white/10 text-white shadow-md relative overflow-hidden group hover:border-blue-500/20 transition-all duration-200">
            <div className="flex items-start gap-4">
              <div className="bg-white/5 p-3 rounded-xl shrink-0 text-blue-400 group-hover:scale-105 transition-transform duration-200">
                <Info className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white uppercase tracking-tight">Important Note</h3>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-medium">
                  Remember to clock out at the end of your shift. Active sessions automatically expire after 12 hours of inactivity.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}




