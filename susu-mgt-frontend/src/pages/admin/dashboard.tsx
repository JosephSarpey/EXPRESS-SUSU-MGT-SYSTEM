

import { useEffect, useState } from 'react'
import {
  Users,
  ArrowUpRight,
  ArrowDownLeft,
  Activity,
  AlertCircle,
  TrendingUp,
  Monitor,
  ShieldCheck,
  Briefcase,
  Settings,
  CreditCard,
  BarChart3
} from 'lucide-react'
import { Card, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { adminService, DashboardStats } from '@/services/api/admin.service'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

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
      <div className="space-y-6 animate-pulse p-8 bg-[#0b1329] min-h-screen">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-[#111c40] rounded-2xl border border-white/5" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-7">
          <div className="h-96 bg-[#111c40] rounded-2xl border border-white/5 lg:col-span-4" />
          <div className="h-96 bg-[#111c40] rounded-2xl border border-white/5 lg:col-span-3" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center px-4 bg-[#0b1329] text-white">
        <AlertCircle className="h-12 w-12 text-emerald-500 mb-4 animate-bounce" />
        <h2 className="text-xl font-bold mb-2 text-zinc-100">Something went wrong</h2>
        <p className="text-zinc-400 mb-6 max-w-md">{error}</p>
        <Button className="bg-emerald-600 hover:bg-emerald-500 text-white" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  // Calculate percentages for the Doughnut Chart
  const totalDeposits = stats?.totalDeposits || 1; 
  const totalWithdrawals = stats?.totalWithdrawals || 0;
  const totalVolume = totalDeposits + totalWithdrawals;
  
  // Circumference calculation for SVG Circle (2 * pi * r) where r = 40 => ~251.2
  const depositPercentage = (totalDeposits / totalVolume) * 100;
  const strokeDashoffset = 251.2 - (251.2 * depositPercentage) / 100;

  return (
    <div className="min-h-screen bg-[#070c1e] text-white p-6 md:p-10 font-sans selection:bg-emerald-500/30">
      
      {/* Top Header Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-white/5 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Wallet Dashboard
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Real-time statistics across platform operations.</p>
        </div>
        <div className="flex items-center gap-6 text-xs text-zinc-400 font-medium">
          <button className="flex items-center gap-2 hover:text-emerald-400 transition-colors duration-300"><Briefcase className="h-4 w-4" /> Accounts</button>
          <button className="flex items-center gap-2 hover:text-emerald-400 transition-colors duration-300"><CreditCard className="h-4 w-4" /> Cards</button>
          <button className="flex items-center gap-2 text-emerald-400 transition-colors duration-300"><BarChart3 className="h-4 w-4" /> Analytics</button>
          <button className="flex items-center gap-2 hover:text-emerald-400 transition-colors duration-300"><Settings className="h-4 w-4" /> Settings</button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Main Balance Box */}
        <Card className="bg-[#111a36] border border-transparent shadow-2xl relative overflow-hidden flex flex-col justify-between p-6 rounded-2xl h-full lg:col-span-1 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] group">
          <div>
            <span className="text-xs font-semibold text-zinc-400 block mb-2 uppercase tracking-wider group-hover:text-emerald-400 transition-colors duration-300">Total Balance</span>
            <h2 className="text-4xl font-extrabold tracking-tight text-white mb-6">
              GH₵ {(stats?.totalWalletsBalance || 0).toLocaleString()}
            </h2>
          </div>
          
          <div className="space-y-3 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-zinc-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                Income (Customers)
              </span>
              <span className="font-bold text-emerald-400">+{stats?.totalCustomers || 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-zinc-400">
                <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                Expenses (Workers)
              </span>
              <span className="font-bold text-blue-400">-{stats?.totalWorkers || 0}</span>
            </div>
          </div>
          {/* Subtle background ambient glow */}
          <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-emerald-500/10 blur-[80px] group-hover:bg-emerald-500/20 transition-all duration-500" />
        </Card>

        {/* System Stats Cards Container */}
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
          {/* Users Card */}
          <Card className="bg-[#0f1630] border border-white/5 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-[0_0_15px_rgba(16,185,129,0.12)]">
            <div className="flex items-center justify-between mb-4">
             <Link to=""> <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Total Users</span></Link>
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-white">{stats?.totalUsers || 0}</div>
              <p className="text-[11px] text-zinc-400 mt-1">Platform-wide registrations</p>
            </div>
          </Card>

          {/* Active Workers Card */}
          <Card className="bg-[#0f1630] border border-white/5 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-[0_0_15px_rgba(16,185,129,0.12)]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Active Workers</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Briefcase className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-white">{stats?.activeWorkers || 0}</div>
              <p className="text-[11px] text-zinc-400 mt-1">Currently active & clocked in</p>
            </div>
          </Card>

          {/* Pending Payouts Card */}
          <Card className="bg-[#0f1630] border border-white/5 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between sm:col-span-2 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-[0_0_15px_rgba(16,185,129,0.12)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Pending Payouts</span>
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <AlertCircle className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-4">
              <div className="text-3xl font-black text-amber-400">{stats?.pendingWithdrawals || 0}</div>
              <p className="textxs text-zinc-400">Withdrawals awaiting manual validation</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        
        {/* Doughnut Chart Volume Summary Segment */}
        <Card className="lg:col-span-4 bg-[#0f1630] border border-white/5 p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Volume Summary
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400 mt-1">
              Proportional distribution breakdown of platform transactions.
            </CardDescription>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6 my-6">
            {/* SVG Custom Doughnut Chart */}
            <div className="relative flex items-center justify-center h-44">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="40"
                  className="stroke-blue-500"
                  strokeWidth="18"
                  fill="transparent"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="40"
                  className="stroke-emerald-400 transition-all duration-500"
                  strokeWidth="18"
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <div className="absolute text-center">
                <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Ratio</p>
                <p className="text-lg font-black text-white">{Math.round(depositPercentage)}%</p>
              </div>
            </div>

            {/* Segment Legends */}
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-[#141d3d] border border-white/5 flex items-center justify-between transition-all duration-300 hover:border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <ArrowDownLeft className="h-4 w-4 text-emerald-400" />
                  <div>
                    <p className="text-xs font-semibold text-zinc-300">Total Deposits</p>
                    <p className="text-xs text-zinc-500">Inflows (Primary)</p>
                  </div>
                </div>
                <span className="text-sm font-black text-emerald-400">{(stats?.totalDeposits || 0).toLocaleString()}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#141d3d] border border-white/5 flex items-center justify-between transition-all duration-300 hover:border-blue-500/20">
                <div className="flex items-center gap-3">
                  <ArrowUpRight className="h-4 w-4 text-blue-400" />
                  <div>
                    <p className="text-xs font-semibold text-zinc-300">Total Withdrawals</p>
                    <p className="text-xs text-zinc-500">Outflows (Secondary)</p>
                  </div>
                </div>
                <span className="text-sm font-black text-blue-400">{(stats?.totalWithdrawals || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-[#080d22]">
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Net Flow</p>
              <p className="text-base font-extrabold text-emerald-400">
                {((stats?.totalDeposits || 0) - (stats?.totalWithdrawals || 0)).toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#080d22]">
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Pending Action</p>
              <p className="text-base font-extrabold text-amber-400">{stats?.pendingWithdrawals}</p>
            </div>
          </div>
        </Card>

        {/* System Health Section */}
        <Card className="lg:col-span-3 bg-[#0f1630] border border-white/5 p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
              <Activity className="h-4 w-4 text-blue-400" />
              System Status
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400 mt-1">Core backend cluster monitoring health.</CardDescription>
          </div>

          <div className="space-y-3 my-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#141d3d] border border-white/5 transition-all duration-300 hover:border-emerald-500/20">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span className="font-medium text-xs text-zinc-200">Database Engine</span>
              </div>
              <Badge className={cn(
                "text-[10px] tracking-wide font-bold uppercase border-none px-2.5 py-0.5 rounded-full",
                stats?.system?.database === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
              )}>
                {stats?.system?.database || 'UNKNOWN'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#141d3d] border border-white/5 transition-all duration-300 hover:border-blue-500/20">
              <div className="flex items-center gap-3">
                <Monitor className="h-4 w-4 text-blue-400" />
                <span className="font-medium text-xs text-zinc-200">REST API Server</span>
              </div>
              <Badge className={cn(
                "text-[10px] tracking-wide font-bold uppercase border-none px-2.5 py-0.5 rounded-full",
                stats?.system?.server === 'STABLE' ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
              )}>
                {stats?.system?.server || 'UNKNOWN'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#141d3d] border border-white/5 transition-all duration-300 hover:border-purple-500/20">
              <div className="flex items-center gap-3">
                <Activity className="h-4 w-4 text-purple-400" />
                <span className="font-medium text-xs text-zinc-200">Worker Instances</span>
              </div>
              <Badge className={cn(
                "text-[10px] tracking-wide font-bold uppercase border-none px-2.5 py-0.5 rounded-full",
                stats?.system?.workerNodes === 'HEALTHY' ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-700 text-zinc-300"
              )}>
                {stats?.system?.workerNodes || 'UNKNOWN'}
              </Badge>
            </div>
          </div>

          {/* Audit Mode Panel block */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#161f3d] to-[#0c1229] border border-white/5 flex flex-col gap-3 transition-colors duration-300 hover:border-emerald-500/20">
            <div>
              <h4 className="font-bold text-xs text-white flex items-center gap-1.5">Audit Mode Active 🛡️</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed mt-0.5">All configuration updates are signed & immutable.</p>
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="flex -space-x-1.5">
                {Array.from({ length: Math.min(stats?.totalAdmins || 0, 3) }).map((_, i) => (
                  <div key={i} className="h-6 w-6 rounded-full bg-[#1e2a52] border border-[#0f1630] flex items-center justify-center text-[8px] font-black text-emerald-300">
                    A{i + 1}
                  </div>
                ))}
                {(stats?.totalAdmins || 0) > 3 && (
                  <div className="h-6 w-6 rounded-full bg-emerald-500 border border-[#0f1630] flex items-center justify-center text-[8px] font-black text-black">
                    +{stats?.totalAdmins! - 3}
                  </div>
                )}
              </div>
              <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">
                {stats?.totalAdmins || 0} {stats?.totalAdmins === 1 ? 'Admin' : 'Admins'} Onboarded
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}