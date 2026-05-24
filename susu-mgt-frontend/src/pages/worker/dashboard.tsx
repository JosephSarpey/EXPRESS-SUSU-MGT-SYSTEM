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
import { format } from 'date-fns'
import { useActiveSession, useWorkerDashboardStats } from '@/hooks/use-worker'
import { cn } from '@/lib/utils'

export function WorkerDashboard() {
  const { data: session, isLoading: isSessionLoading } = useActiveSession()
  const { data: stats, isLoading: isStatsLoading } = useWorkerDashboardStats()

  const isLoading = isSessionLoading || isStatsLoading

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse bg-[#070c1e] p-6 md:p-10 min-h-screen">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-[#141d3d]/80 rounded-2xl" />
          ))}
        </div>
        <div className="h-96 bg-[#141d3d]/40 rounded-2xl" />
      </div>
    )
  }

  const isClockedIn = !!session

  return (
    <div className="bg-[#070c1e] min-h-screen text-white p-6 md:p-10 font-sans selection:bg-emerald-500/30 space-y-8 pb-12 animate-in fade-in duration-500">
      
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
           EXPRESS <span className='text-green-500'>CAPITAL</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage your collections and daily activity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className={cn("rounded-xl border border-white/5 font-bold transition-all duration-300 h-11 px-5", isClockedIn ? "bg-[#141d3d] hover:bg-[#1c2957] text-zinc-300 hover:text-white" : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-950/20")}>
            <Link to="/worker/clock-in-out">
              <Clock className="mr-2 h-4 w-4" />
              {isClockedIn ? 'Clock Out' : 'Clock In'}
            </Link>
          </Button>
          <Button asChild disabled={!isClockedIn} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all duration-300 h-11 px-5 shadow-lg shadow-blue-950/20 disabled:opacity-40">
            <Link to="/worker/cash-deposit">
              <Wallet className="mr-2 h-4 w-4" />
              Record Collection
            </Link>
          </Button>
        </div>
      </div>

      {/* Clocked Out Warning Banner */}
      {!isClockedIn && (
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
            <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/20">
              <AlertCircle className="h-6 w-6 text-red-400 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-bold text-white tracking-tight">You are currently Clocked Out</h3>
              <p className="text-xs text-zinc-400 mt-0.5">You must clock in before you can record any cash collections.</p>
            </div>
          </div>
          <Button asChild className="bg-red-500 hover:bg-red-600 text-white border-none rounded-xl font-bold px-6 h-10 transition-colors duration-200 shadow-md">
            <Link to="/worker/clock-in-out">Clock In Now</Link>
          </Button>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid gap-6 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Session Card */}
        <Card className={cn(
          "border border-white/5 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 relative",
          isClockedIn ? "bg-[#10b981]/5 hover:border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.05)]" : "bg-[#0f1630]"
        )}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4 md:p-6">
            <CardTitle className="text-[11px] font-bold opacity-60 uppercase tracking-widest text-zinc-400">Session Status</CardTitle>
            <Clock className={cn("h-4 w-4", isClockedIn ? "text-emerald-400" : "text-zinc-500")} />
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className={cn("text-2xl font-black tracking-tight", isClockedIn ? "text-emerald-400" : "text-zinc-400")}>
              {isClockedIn ? 'CLOCKED IN' : 'OFF DUTY'}
            </div>
            {isClockedIn && (
              <p className="text-[10px] font-medium text-zinc-500 mt-2">
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
        <Card className="border border-white/5 bg-[#0f1630] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4 md:p-6">
            <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Today's Collections</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="text-2xl font-bold tracking-tight text-white">{stats?.todayCollections || 0}</div>
            <p className="text-[10px] font-medium text-zinc-500 mt-2 leading-normal">
              Number of successful collections today
            </p>
          </CardContent>
        </Card>

        {/* Today's Volume */}
        <Card className="border border-white/5 bg-[#0f1630] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4 md:p-6">
            <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Today's Volume</CardTitle>
            <Wallet className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="text-2xl font-bold tracking-tight text-white">GH₵ {(stats?.todayAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <p className="text-[10px] font-medium text-zinc-500 mt-2 leading-normal">
              Total cash collected today
            </p>
          </CardContent>
        </Card>
        {/* Pending Payouts */}
        <Card className="border border-white/5 bg-[#0f1630] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-amber-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4 md:p-6">
            <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Pending Payouts</CardTitle>
            <Banknote className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="text-2xl font-bold tracking-tight text-white">{stats?.pendingWithdrawals || 0}</div>
            <p className="text-[10px] font-medium text-zinc-500 mt-2 leading-normal">
              Withdrawals awaiting cash payment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Containers Layout View */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Field Operations */}
        <Card className="border border-white/5 bg-[#0f1630] rounded-2xl overflow-hidden shadow-2xl">
          <CardHeader className="p-4 md:p-6 border-b border-white/5 bg-[#0b1026]">
            <CardTitle className="text-base font-bold text-white tracking-tight">Field Operations</CardTitle>
            <CardDescription className="text-xs text-zinc-400 mt-0.5">Quick access to your primary tasks.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 grid gap-4 bg-[#0f1630]">
            <Link 
              to="/worker/cash-deposit"
              className={cn(
                "flex items-center justify-between p-5 rounded-xl border transition-all duration-250 group",
                !isClockedIn 
                  ? "opacity-30 pointer-events-none border-white/5 bg-zinc-900/10" 
                  : "border-white/5 bg-[#0b1026]/40 hover:bg-[#131c3d]/60 hover:border-blue-500/20"
              )}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={cn(
                  "p-3 rounded-xl border shrink-0 transition-transform duration-300 group-hover:scale-105",
                  !isClockedIn ? "bg-zinc-800 text-zinc-600 border-white/5" : "bg-blue-500/10 text-blue-400 border-blue-500/10"
                )}>
                  <Wallet className="h-5 w-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-zinc-200 group-hover:text-white transition-colors duration-200">Record Cash Collection</h4>
                  <p className="text-xs text-zinc-500 mt-1 truncate pr-2">Collect money from a customer in person.</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>

            <Link 
              to="/worker/collection-history"
              className="flex items-center justify-between p-5 rounded-xl border border-white/5 bg-[#0b1026]/40 hover:bg-[#131c3d]/60 hover:border-emerald-500/20 transition-all duration-250 group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 rounded-xl shrink-0 transition-transform duration-300 group-hover:scale-105">
                  <History className="h-5 w-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-zinc-200 group-hover:text-white transition-colors duration-200">Collection History</h4>
                  <p className="text-xs text-zinc-500 mt-1 truncate pr-2">View your past collections and summaries.</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          </CardContent>
        </Card>

        {/* Daily Schedule */}
        <Card className="border border-white/5 bg-[#0f1630] rounded-2xl overflow-hidden shadow-2xl">
          <CardHeader className="p-4 md:p-6 border-b border-white/5 bg-[#0b1026]">
            <CardTitle className="text-base font-bold text-white tracking-tight">Daily Schedule</CardTitle>
            <CardDescription className="text-xs text-zinc-400 mt-0.5">Your assigned tasks and routes will appear here.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 bg-[#0f1630]">
            <div className="text-center py-8 text-zinc-500 bg-[#0b1026]/20 rounded-xl border border-dashed border-white/5">
              <Calendar className="h-10 w-10 mx-auto mb-3 opacity-40 text-blue-400" />
              <p className="text-xs font-semibold text-zinc-400 tracking-tight">No schedule data available</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


