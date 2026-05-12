import { useEffect, useState } from 'react'
import {
  Users,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Activity,
  AlertCircle,
  TrendingUp,
  Monitor,
  ShieldCheck,
  Briefcase
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { adminService, DashboardStats } from '@/services/api/admin.service'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        const data = await adminService.getDashboardStats()
        setStats(data)
      } catch (err) {
        console.error('Error fetching admin stats:', err)
        setError('Failed to load system statistics.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-96 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
          <div className="h-96 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-md">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      description: `${stats?.totalCustomers} Customers, ${stats?.totalWorkers} Workers`,
      color: 'blue'
    },
    {
      title: 'System Balance',
      value: `GH₵ ${(stats?.totalWalletsBalance || 0).toLocaleString()}`,
      icon: Wallet,
      description: 'Combined wallet balances',
      color: 'emerald'
    },
    {
      title: 'Active Workers',
      value: stats?.activeWorkers || 0,
      icon: Briefcase,
      description: 'Currently clocked in',
      color: 'amber'
    },
    {
      title: 'Pending Payouts',
      value: stats?.pendingWithdrawals || 0,
      icon: AlertCircle,
      description: 'Withdrawals awaiting approval',
      color: 'red'
    }
  ]

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">System Overview</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Real-time statistics across all platform operations.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title} className="border-none shadow-sm overflow-hidden relative">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{card.title}</CardTitle>
              <card.icon className={cn(
                "h-4 w-4",
                card.color === 'blue' && "text-blue-600",
                card.color === 'emerald' && "text-emerald-600",
                card.color === 'amber' && "text-amber-600",
                card.color === 'red' && "text-red-600",
              )} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold">{card.value}</div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{card.description}</p>
            </CardContent>
            <div className={cn(
              "absolute bottom-0 left-0 h-1 w-full opacity-20",
              card.color === 'blue' && "bg-blue-600",
              card.color === 'emerald' && "bg-emerald-600",
              card.color === 'amber' && "bg-amber-600",
              card.color === 'red' && "bg-red-600",
            )} />
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Financial Performance */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Volume Summary
            </CardTitle>
            <CardDescription>Comparison between total deposits and withdrawals.</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col justify-end gap-8 pt-12">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-bold">Total Deposits</span>
                </div>
                <span className="text-lg font-extrabold"> {(stats?.totalDeposits || 0).toLocaleString()}</span>
              </div>
              <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[70%]" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-bold">Total Withdrawals</span>
                </div>
                <span className="text-lg font-extrabold"> {(stats?.totalWithdrawals || 0).toLocaleString()}</span>
              </div>
              <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-[30%]" />
              </div>
            </div>

            <div className="pt-6 border-t dark:border-zinc-800 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50">
                <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1">Net Flow</p>
                <p className="text-xl font-extrabold text-blue-600"> {((stats?.totalDeposits || 0) - (stats?.totalWithdrawals || 0)).toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50">
                <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1">Pending Requests</p>
                <p className="text-xl font-extrabold text-red-600">{stats?.pendingWithdrawals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              System Status
            </CardTitle>
            <CardDescription>Core infrastructure and security health.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/50">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <span className="font-bold text-sm">Database</span>
              </div>
              <Badge variant={stats?.system?.database === 'ACTIVE' ? 'success' : 'destructive'}>
                {stats?.system?.database || 'UNKNOWN'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/50">
              <div className="flex items-center gap-3">
                <Monitor className="h-5 w-5 text-blue-500" />
                <span className="font-bold text-sm">API Server</span>
              </div>
              <Badge variant={stats?.system?.server === 'STABLE' ? 'success' : 'warning'}>
                {stats?.system?.server || 'UNKNOWN'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/50">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-purple-500" />
                <span className="font-bold text-sm">Worker Nodes</span>
              </div>
              <Badge variant={stats?.system?.workerNodes === 'HEALTHY' ? 'success' : 'secondary'}>
                {stats?.system?.workerNodes || 'UNKNOWN'}
              </Badge>
            </div>

            <div className="mt-8 p-6 rounded-3xl bg-zinc-900 text-white flex flex-col gap-4">
              <div>
                <h4 className="font-bold mb-1">Audit Mode 🛡️</h4>
                <p className="text-xs text-zinc-400">All administrative actions are logged and traceable in the audit trail.</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {Array.from({ length: Math.min(stats?.totalAdmins || 0, 3) }).map((_, i) => (
                    <div key={i} className="h-8 w-8 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-[10px] font-bold">
                      A{i + 1}
                    </div>
                  ))}
                  {(stats?.totalAdmins || 0) > 3 && (
                    <div className="h-8 w-8 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-[10px] font-bold">
                      +{(stats?.totalAdmins || 0) - 3}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                  {stats?.totalAdmins || 0} {stats?.totalAdmins === 1 ? 'Admin' : 'Admins'} Registered
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
