







import { useEffect, useState, useRef, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from "../../assets/logo2.png";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  ArrowRight,
  User,
  MapPin,
  EyeOff,
  Bell,
  Send,
  Gift,
  MoreHorizontal,
  LogOut
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { walletsService, Wallet as WalletType } from '@/services/api/wallets.service'
import { transactionsService, Transaction } from '@/services/api/transactions.service'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useAuthStore, useNotificationsStore } from "@/store"

export function CustomerDashboard() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  
  // Notification Store Hook Elements
  const {
    items,
    unreadCount,
    isLoadingList,
    isMarkingAll,
    fetchList,
    markRead,
    markAllRead,
    reset: resetNotifications,
  } = useNotificationsStore()

  const [wallet, setWallet] = useState<WalletType | null>(null)
  const [stats, setStats] = useState<{ totalDeposited: number, totalWithdrawn: number } | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  
  const notificationsRef = useRef<HTMLDivElement | null>(null)
  const profileRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let isMounted = true
    
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        const [walletData, statsData, transactionsData] = await Promise.all([
          walletsService.getMyWallet(),
          walletsService.getWalletStats(),
          transactionsService.getMyTransactions({ limit: 5 })
        ])
        
        if (isMounted) {
          setWallet(walletData)
          setStats(statsData)
          setRecentTransactions(transactionsData.data)
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        if (isMounted) {
          setError('Failed to load dashboard data. Please try again later.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchDashboardData()
    return () => { isMounted = false }
  }, [])

  // Notification population layer sync
  useEffect(() => {
    if (!isNotificationsOpen) return
    fetchList({ page: 1, limit: 10 })
  }, [isNotificationsOpen, fetchList])

  // Shared outside clicks tracking engine
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null
      if (!target) return

      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setIsNotificationsOpen(false)
      }

      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const notificationsPath = useMemo(() => {
    if (!user) return "/login"
    if (user.role === "CUSTOMER") return "/customer/notifications"
    if (user.role === "WORKER") return "/worker/notifications"
    return "/admin/notifications"
  }, [user])

  const unreadLabel = unreadCount > 9 ? "9+" : String(unreadCount)

  const handleLogout = async () => {
    await logout()
    resetNotifications()
    navigate("/login")
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4 max-w-6xl mx-auto bg-[#004D40] min-h-screen">
        <div className="flex justify-between items-center pt-4">
          <div className="h-10 w-10 bg-teal-900/50 rounded-full" />
          <div className="h-10 w-24 bg-teal-900/50 rounded-xl" />
          <div className="h-10 w-10 bg-teal-900/50 rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-44 bg-teal-900/40 rounded-2xl md:col-span-2" />
          <div className="h-44 bg-teal-900/40 rounded-2xl" />
        </div>
        <div className="h-64 bg-teal-900/20 rounded-2xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#004D40] text-center px-6 text-white">
        <div className="p-4 bg-red-950/40 rounded-full mb-4 border border-red-900/50">
          <AlertCircle className="h-10 w-10 text-red-400" />
        </div>
        <h2 className="text-xl font-bold tracking-tight mb-2">Something went wrong</h2>
        <p className="text-teal-200 mb-6 text-sm leading-relaxed">{error}</p>
        <Button onClick={() => window.location.reload()} size="sm" className="rounded-xl px-5 bg-[#FFCC00] text-[#004D40] font-bold hover:bg-[#E6B800]">
          Retry Connection
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-[#004D40] min-h-screen text-white font-sans w-full flex flex-col justify-between pb-24 md:pb-6 relative">
      
      {/* Universal Top Header Row */}
      <header className="w-full max-w-6xl mx-auto px-4 md:px-8 pt-4 pb-4 flex items-center justify-between md:justify-center border-b border-white/5 relative z-50">
        
        {/* User Profile Avatar Popover - Hidden completely on large screens */}
        <div className="relative md:hidden" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="h-9 w-9 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-[#004D40] font-black text-sm ring-offset-[#004D40] transition-all hover:ring-2 hover:ring-[#FFCC00] hover:ring-offset-2 focus:outline-none overflow-hidden shrink-0"
          >
            {user?.fullName?.charAt(0) || user?.email?.charAt(0) || "U"}
          </button>

          {/* User Profile Action Panel Floating Context Menu */}
          {isProfileOpen && (
            <div className="absolute left-0 mt-2 w-56 bg-white border border-zinc-200 text-[#004D40] dark:bg-zinc-950 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <p className="text-xs font-black text-[#00332c] dark:text-zinc-100 truncate">
                  {user?.fullName}
                </p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5 font-medium">
                  {user?.email}
                </p>
              </div>
              <div className="p-1.5 space-y-0.5">
                <Link
                  to={`/${user?.role?.toLowerCase()}/profile`}
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl transition-colors"
                >
                  <User className="h-4 w-4 text-zinc-400" />
                  Edit Profile
                </Link>
                {user?.role === "CUSTOMER" && (
                  <Link
                    to="/customer/addresses"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl transition-colors"
                  >
                    <MapPin className="h-4 w-4 text-zinc-400" />
                    My Addresses
                  </Link>
                )}
                <button
                  onClick={() => {
                    setIsProfileOpen(false)
                    handleLogout()
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Styled App Brand Identity Element */}
        <div className="bg-[#FFCC00] text-[#004D40] px-5 py-2 rounded-xl font-black transform -rotate-3 flex items-center justify-center shadow-lg">
          <span className="text-xl tracking-tighter uppercase">MoMo Wallet</span>
        </div>

        {/* Dynamic Notification Layer - Hidden completely on large screens */}
        <div className="relative md:hidden" ref={notificationsRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative cursor-pointer p-2 hover:opacity-80 transition-opacity rounded-full hover:bg-white/5"
          >
            <Bell className="h-6 w-6 text-white" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#004D40] shadow-sm animate-pulse">
                {unreadLabel}
              </span>
            )}
          </button>

          {/* Core Floating Notifications Popup Frame */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white text-[#004D40] border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="text-xs font-black uppercase tracking-wider text-[#00332c] dark:text-zinc-100">
                  Notifications
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await markAllRead()
                    }}
                    disabled={isMarkingAll}
                    className="rounded-lg text-[10px] font-bold h-7 border-zinc-200 text-[#004D40] dark:text-white"
                  >
                    Mark read
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsNotificationsOpen(false)
                      navigate(notificationsPath)
                    }}
                    className="rounded-lg text-[10px] font-bold h-7 text-teal-600 dark:text-teal-400"
                  >
                    View all
                  </Button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
                {isLoadingList ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl animate-pulse"
                      />
                    ))}
                  </div>
                ) : items.length === 0 ? (
                  <div className="p-6 text-center text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                    No notifications found.
                  </div>
                ) : (
                  items.map((n) => {
                    const isUnread = !n.readAt
                    return (
                      <button
                        key={n.id}
                        onClick={async () => {
                          if (isUnread) await markRead(n.id)
                        }}
                        className={cn(
                          "w-full text-left px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors flex flex-col gap-0.5",
                          isUnread && "bg-teal-50/40 dark:bg-teal-900/10",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3 w-full">
                          <span className="text-xs font-black text-[#00332c] dark:text-zinc-100 truncate flex-1">
                            {n.subject ?? n.type}
                          </span>
                          <span className="text-[9px] font-medium text-zinc-400 shrink-0">
                            {format(new Date(n.createdAt), "MMM dd • HH:mm")}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal line-clamp-2">
                          {n.message}
                        </p>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="w-full max-w-6xl mx-auto px-4 md:px-8 mt-6 flex-1 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left / Top Stack Section: Core Balance & Actions */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Main App Wallet Balance Container */}
            <Card className="bg-white text-[#004D40] border-none shadow-xl rounded-2xl overflow-hidden relative">
              <CardHeader className="pb-1 pt-6 px-6 flex flex-col items-center relative">
                <Badge className="absolute top-0 left-0 bg-[#FFCC00] text-[#004D40] font-black rounded-tl-2xl rounded-br-2xl rounded-tr-none rounded-bl-none px-5 py-1.5 text-xs uppercase tracking-wider">
                  Wallet
                </Badge>
                <span className="text-sm font-bold text-zinc-500 tracking-wide mt-2">
                  Account Number: {wallet?.id || "0550817954"}
                </span>
                <div className="flex items-center justify-center gap-3 mt-2 w-full px-4">
                  <div className="text-3xl sm:text-4xl font-black tracking-tight text-[#00332c] text-center flex-1 ml-6">
                    <span className="text-lg font-bold mr-1.5 text-zinc-400">GH₵</span>
                    {(wallet?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <EyeOff className="h-5 w-5 text-zinc-400 cursor-pointer shrink-0 hover:text-zinc-600" />
                </div>
              </CardHeader>

              {/* Quick Wallet Action Links */}
              <CardContent className="grid grid-cols-3 border-t border-zinc-100 p-0 mt-6 text-center divide-x divide-zinc-100 bg-zinc-50/50">
                <Link to="/customer/deposit" className="py-4 flex flex-col items-center justify-center hover:bg-zinc-50 transition-colors group">
                  <ArrowDownLeft className="h-5 w-5 text-[#004D40] group-hover:scale-110 transition-transform mb-1" />
                  <span className="text-xs font-bold text-[#004D40]">Deposit</span>
                </Link>
                <Link to="/customer/withdraw" className="py-4 flex flex-col items-center justify-center hover:bg-zinc-50 transition-colors group">
                  <ArrowUpRight className="h-5 w-5 text-[#004D40] group-hover:scale-110 transition-transform mb-1" />
                  <span className="text-xs font-bold text-[#004D40]">Withdraw</span>
                </Link>
                <Link to="/customer/transactions" className="py-4 flex flex-col items-center justify-center hover:bg-zinc-50 transition-colors group">
                  <History className="h-5 w-5 text-[#004D40] group-hover:scale-110 transition-transform mb-1" />
                  <span className="text-xs font-bold text-[#004D40]">Statements</span>
                </Link>
              </CardContent>
            </Card>

            {/* Split Information Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/customer/transactions" className="bg-white text-[#004D40] p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-md hover:bg-zinc-50 transition-colors group">
                <Send className="h-7 w-7 text-[#004D40] mb-2 group-hover:translate-x-1 transition-transform" />
                <span className="text-sm font-black tracking-tight">View Transactions</span>
              </Link>
              
              <div className="bg-white text-[#004D40] p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-md transition-colors">
                <TrendingUp className="h-7 w-7 text-emerald-600 mb-2" />
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Cumulative Savings</span>
                <span className="text-lg font-black text-[#00332c] mt-0.5">
                  GH₵ {(stats?.totalDeposited || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Compact Recent Activity Transactions Feed */}
            <Card className="border-none bg-white text-[#004D40] rounded-2xl overflow-hidden shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-5 border-b border-zinc-100">
                <CardTitle className="text-sm md:text-base font-black">Recent Logs</CardTitle>
                <Button asChild variant="ghost" size="sm" className="text-xs font-bold text-teal-600 hover:bg-teal-50 px-2 rounded-lg h-7">
                  <Link to="/customer/transactions" className="flex items-center gap-0.5">
                    View All
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {recentTransactions.length > 0 ? (
                    recentTransactions.map((tx) => {
                      const isCredit = tx.type === 'DEPOSIT' || tx.type === 'COLLECTION'
                      return (
                        <div key={tx.id} className="flex items-center justify-between bg-zinc-50 p-3 rounded-xl border border-zinc-100 hover:bg-zinc-100/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2.5 rounded-lg",
                              isCredit ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                            )}>
                              {isCredit ? (
                                <ArrowDownLeft className="h-4 w-4 stroke-[2.5]" />
                              ) : (
                                <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-xs md:text-sm text-[#00332c]">
                                {tx.type} <span className="font-normal text-zinc-400">via</span> {tx.paymentMethod?.replace('_', ' ')}
                              </p>
                              <p className="text-[10px] text-zinc-400 mt-0.5">
                                {format(new Date(tx.createdAt), 'MMM dd, yyyy • hh:mm a')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-1">
                            <p className={cn(
                              "font-black text-xs md:text-sm tracking-tight",
                              isCredit ? "text-emerald-600" : "text-amber-600"
                            )}>
                              {isCredit ? '+' : '-'} GH₵{tx.amount || 0}
                            </p>
                            <span className="text-[9px] font-bold bg-zinc-200 text-zinc-700 px-1.5 py-0.5 rounded">
                              {tx.status}
                            </span>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-8 text-zinc-400 text-sm">
                      No account transaction logs found.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Section Panel */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <Card className="border-none bg-white/5 text-white rounded-2xl">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-teal-200 uppercase tracking-wider">Total Saved</p>
                    <p className="text-xl font-black mt-1">
                      <span className="text-xs text-teal-300 font-medium mr-0.5">GH₵</span>
                      {(stats?.totalDeposited || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="bg-emerald-500/10 p-2.5 rounded-xl">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none bg-white/5 text-white rounded-2xl">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-teal-200 uppercase tracking-wider">Withdrawn</p>
                    <p className="text-xl font-black mt-1">
                      <span className="text-xs text-teal-300 font-medium mr-0.5">GH₵</span>
                      {(stats?.totalWithdrawn || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="bg-amber-500/10 p-2.5 rounded-xl">
                    <TrendingDown className="h-5 w-5 text-amber-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Dynamic Rewards Banner Container */}
            <div className="bg-gradient-to-br from-teal-700 via-teal-600 to-amber-500 rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between border border-teal-400/20 h-44">
              <div className="space-y-1 relative z-10">
                <h4 className="font-black text-sm md:text-base text-white tracking-tight uppercase">Streak Bonus Active 🔥</h4>
                <p className="text-xs text-teal-100 leading-normal pt-1">
                  Save consistently every week to unlock premium interest rates and milestone badges. Consistency builds wealth!
                </p>
              </div>
              <div className="flex items-center justify-between pt-4 relative z-10">
                <div className="text-xs font-bold text-[#FFCC00] flex items-center gap-1 cursor-pointer hover:underline">
                  <span>Click to earn points</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
                <Gift className="h-7 w-7 text-[#FFCC00]" />
              </div>
            </div>

            {/* Hub Operations Short Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              <Link to="/customer/addresses" className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-[#FFCC00]" />
                  <div className="text-left">
                    <p className="font-bold text-xs text-white">Addresses</p>
                    <p className="text-[10px] text-teal-200">Manage drop zones</p>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-teal-300" />
              </Link>
              <Link to="/customer/profile" className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-[#FFCC00]" />
                  <div className="text-left">
                    <p className="font-bold text-xs text-white">Security</p>
                    <p className="text-[10px] text-teal-200">Manage profile parameters</p>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-teal-300" />
              </Link>
            </div>

            {/* Bottom Active Indicator Row */}
            <div className="text-[11px] text-teal-200 flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-xl py-2.5 w-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Wallet Active Status: <span className="font-bold text-white uppercase">{wallet?.status || "ACTIVE"}</span></span>
            </div>

          </div>
        </div>
      </main>

      {/* Mobile Sticky Tab Navigation Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-zinc-100 grid grid-cols-5 items-center justify-center py-2 px-1 text-center shadow-2xl rounded-t-2xl z-50">
        <Link to="/" className="flex flex-col items-center justify-center text-[#004D40] font-bold">
          <Wallet className="h-5 w-5 mb-0.5" />
          <span className="text-[10px]">Home</span>
        </Link>
        <Link to="/customer/transactions" className="flex flex-col items-center justify-center text-zinc-400 hover:text-[#004D40] transition-colors">
          <Send className="h-5 w-5 mb-0.5" />
          <span className="text-[10px]">Transactions</span>
        </Link>
        
        <div className="flex flex-col items-center justify-center"> 
          <div className="rounded-full shadow-lg border-white hover:scale-105 transition-transform cursor-pointer bg-blue-500 flex items-center justify-center">
            <img className='h-16 w-16' src={logo} alt="Logo" />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-zinc-400 cursor-pointer hover:text-[#004D40] transition-colors">
          <Gift className="h-5 w-5 mb-0.5" />
          <span className="text-[10px]">Offers</span>
        </div>
        <div className="flex flex-col items-center justify-center text-zinc-400 cursor-pointer hover:text-[#004D40] transition-colors">
          <MoreHorizontal className="h-5 w-5 mb-0.5" />
          <span className="text-[10px]">More</span>
        </div>
      </div>

    </div>
  )
}