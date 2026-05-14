import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Clock, 
  Wallet, 
  History, 
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Calendar,
  Banknote
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { workersService } from '@/services/api/workers.service'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export function WorkerDashboard() {
  const [session, setSession] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchWorkerData = async () => {
      try {
        setIsLoading(true)
        const [sessionData, statsData] = await Promise.all([
          workersService.getActiveSession(),
          workersService.getWorkerStats()
        ])
        console.log('Dashboard data:', { sessionData, statsData })
        setSession(sessionData)
        setStats(statsData)
      } catch (err) {
        console.error('Error fetching worker data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkerData()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
          ))}
        </div>
        <div className="h-96 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
      </div>
    )
  }

  const isClockedIn = !!session

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">Worker Dashboard</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage your collections and daily activity.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant={isClockedIn ? "outline" : "primary"} className="rounded-full">
            <Link to="/worker/clock-in-out">
              <Clock className="mr-2 h-4 w-4" />
              {isClockedIn ? 'Clock Out' : 'Clock In'}
            </Link>
          </Button>
          <Button asChild disabled={!isClockedIn} className="rounded-full">
            <Link to="/worker/cash-deposit">
              <Wallet className="mr-2 h-4 w-4" />
              Record Collection
            </Link>
          </Button>
        </div>
      </div>

      {!isClockedIn && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
            <div className="bg-amber-100 dark:bg-amber-900/40 p-3 rounded-2xl">
              <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-amber-900 dark:text-amber-100">You are currently Clocked Out</h3>
              <p className="text-sm text-amber-700 dark:text-amber-400">You must clock in before you can record any cash collections.</p>
            </div>
          </div>
          <Button asChild variant="warning" className="bg-amber-600 hover:bg-amber-500 text-white border-none rounded-full px-8">
            <Link to="/worker/clock-in-out">Clock In Now</Link>
          </Button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Session Card */}
        <Card className={cn(
          "border-none shadow-lg transition-all",
          isClockedIn ? "bg-emerald-600 text-white shadow-emerald-500/20" : "bg-zinc-800 text-white"
        )}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium opacity-80 uppercase tracking-wider">Session Status</CardTitle>
            <Clock className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">{isClockedIn ? 'CLOCKED IN' : 'OFF DUTY'}</div>
            {isClockedIn && (
              <p className="text-xs opacity-80 mt-2">
                Started at {(() => {
                  if (!session.clockInTime) return 'Unknown time'
                  const date = new Date(session.clockInTime)
                  return isNaN(date.getTime()) ? 'Invalid time' : format(date, 'hh:mm a')
                })()}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Collections Today */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Today's Collections</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.todayCollections}</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
              Number of successful collections today
            </p>
          </CardContent>
        </Card>
        {/* Today's Volume */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Today's Volume</CardTitle>
            <Wallet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">GH₵ {(stats?.todayAmount || 0).toLocaleString()}</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
              Total cash collected today
            </p>
          </CardContent>
        </Card>

        {/* Pending Payouts */}
        <Card className="hover:border-amber-200 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Pending Payouts</CardTitle>
            <Banknote className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.pendingWithdrawals || 0}</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
              Withdrawals awaiting cash payment
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Field Operations</CardTitle>
            <CardDescription>Quick access to your primary tasks.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Link 
              to="/worker/cash-deposit"
              className={cn(
                "flex items-center justify-between p-6 rounded-3xl border transition-all group",
                !isClockedIn ? "opacity-50 pointer-events-none grayscale" : "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200"
              )}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl">
                  <Wallet className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Record Cash Collection</h4>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Collect money from a customer in person.</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-zinc-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link 
              to="/worker/collection-history"
              className="flex items-center justify-between p-6 rounded-3xl border transition-all group hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-2xl">
                  <History className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Collection History</h4>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">View your past collections and summaries.</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
            </Link>
          </CardContent>
        </Card>

        {/* Daily Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Schedule</CardTitle>
            <CardDescription>Your assigned tasks and routes will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No schedule data available</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
