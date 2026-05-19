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
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const isClockedIn = !!session

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">Attendance</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage your work session and field availability.</p>
        </div>
      </div>

      <div className="grid gap-8">
        <Card className={cn(
          "relative overflow-hidden transition-all duration-500",
          isClockedIn ? "border-emerald-200 dark:border-emerald-900/30 shadow-emerald-500/10" : "border-zinc-200 dark:border-zinc-800"
        )}>
          <div className={cn(
            "absolute top-0 left-0 w-1.5 h-full",
            isClockedIn ? "bg-emerald-600" : "bg-zinc-300 dark:bg-zinc-700"
          )} />
          
          <CardHeader className="pt-8 px-8">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Session Status</CardTitle>
                <CardDescription className="mt-1">
                  {isClockedIn ? 'Your session is active' : 'You are currently inactive'}
                </CardDescription>
              </div>
              <div className={cn(
                "h-12 w-12 rounded-2xl flex items-center justify-center",
                isClockedIn ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
              )}>
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8 space-y-8">
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-3xl dark:border-zinc-800">
              <div className={cn(
                "h-32 w-32 rounded-full flex items-center justify-center shadow-2xl mb-6 relative group transition-all",
                isClockedIn 
                  ? "bg-emerald-600 text-white shadow-emerald-500/30 hover:bg-emerald-500" 
                  : "bg-blue-600 text-white shadow-blue-500/30 hover:bg-blue-500"
              )}>
                <button
                  onClick={handleClockToggle}
                  disabled={isSubmitting}
                  className="absolute inset-0 flex items-center justify-center rounded-full"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-12 w-12 animate-spin" />
                  ) : (
                    <Power className="h-12 w-12" />
                  )}
                </button>
              </div>
              <h3 className="text-xl font-bold mb-1">
                {isClockedIn ? 'End Session' : 'Start Session'}
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {isClockedIn ? 'Click to clock out for the day' : 'Click to clock in and start working'}
              </p>
            </div>

            {isClockedIn && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Clock In Time</p>
                  <p className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
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
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-4 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
          </CardContent>

          <CardFooter className="bg-zinc-50 dark:bg-zinc-900/50 px-8 py-4 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Your location and device information are logged for security purposes.
            </p>
          </CardFooter>
        </Card>

        <div className="p-6 rounded-3xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 flex gap-4">
          <Info className="h-6 w-6 text-blue-600 shrink-0" />
          <div className="space-y-1">
            <h4 className="font-bold text-blue-900 dark:text-blue-100">Important Note</h4>
            <p className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">
              Remember to clock out at the end of your shift. Active sessions automatically expire after 12 hours of inactivity.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
