import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Settings,
  LogOut,
  User,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  MapPin,
  Menu,
  X,
  Bell,
  Clock,
  ArrowLeftRight,
  Banknote
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuthStore, useNotificationsStore } from '@/store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

interface SidebarItem {
  name: string
  href: string
  icon: any
  roles: ('ADMIN' | 'CUSTOMER' | 'WORKER')[]
}

const sidebarItems: SidebarItem[] = [
  // Customer items
  { name: 'Dashboard', href: '/customer/dashboard', icon: LayoutDashboard, roles: ['CUSTOMER'] },
  { name: 'Deposit', href: '/customer/deposit', icon: ArrowDownLeft, roles: ['CUSTOMER'] },
  { name: 'Withdraw', href: '/customer/withdraw', icon: ArrowUpRight, roles: ['CUSTOMER'] },
  { name: 'Transactions', href: '/customer/transactions', icon: ArrowLeftRight, roles: ['CUSTOMER'] },
  { name: 'Profile', href: '/customer/profile', icon: User, roles: ['CUSTOMER'] },
  { name: 'Addresses', href: '/customer/addresses', icon: MapPin, roles: ['CUSTOMER'] },

  // Worker items
  { name: 'Dashboard', href: '/worker/dashboard', icon: LayoutDashboard, roles: ['WORKER'] },
  { name: 'Clock In/Out', href: '/worker/clock-in-out', icon: Clock, roles: ['WORKER'] },
  { name: 'Cash Deposit', href: '/worker/cash-deposit', icon: Wallet, roles: ['WORKER'] },
  { name: 'Collections', href: '/worker/collection-history', icon: History, roles: ['WORKER'] },

  // Admin items
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, roles: ['ADMIN'] },
  { name: 'User Management', href: '/admin/user-management', icon: Users, roles: ['ADMIN'] },
  { name: 'Worker Management', href: '/admin/worker-management', icon: Users, roles: ['ADMIN'] },
  { name: 'Wallet Management', href: '/admin/wallet-management', icon: Wallet, roles: ['ADMIN'] },
  { name: 'User Approval', href: '/admin/user-approval', icon: UserCheck, roles: ['ADMIN'] },
  { name: 'Transactions', href: '/admin/transaction-monitoring', icon: ArrowLeftRight, roles: ['ADMIN'] },
  { name: 'Withdrawal Requests', href: '/admin/withdrawal-requests', icon: Banknote, roles: ['ADMIN'] },
  { name: 'Audit Logs', href: '/admin/audit-logs', icon: History, roles: ['ADMIN'] },
  { name: 'Settings', href: '/admin/settings', icon: Settings, roles: ['ADMIN'] },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore()
  const {
    items,
    unreadCount,
    isLoadingList,
    isMarkingAll,
    fetchList,
    fetchUnreadCount,
    markRead,
    markAllRead,
    reset: resetNotifications,
  } = useNotificationsStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const notificationsRef = useRef<HTMLDivElement | null>(null)
  const mobileNotificationsRef = useRef<HTMLDivElement | null>(null)
  const profileRef = useRef<HTMLDivElement | null>(null)

  const filteredItems = sidebarItems.filter(item => user && item.roles.includes(user.role))

  const notificationsPath = useMemo(() => {
    if (!user) return '/login'
    if (user.role === 'CUSTOMER') return '/customer/notifications'
    if (user.role === 'WORKER') return '/worker/notifications'
    return '/admin/notifications'
  }, [user])

  const unreadLabel = unreadCount > 9 ? '9+' : String(unreadCount)

  const handleLogout = async () => {
    await logout()
    resetNotifications()
    navigate('/login')
  }

  useEffect(() => {
    if (!user) return

    fetchUnreadCount()

    let intervalId: number | null = null

    const start = () => {
      if (intervalId !== null) return
      intervalId = window.setInterval(() => {
        if (document.hidden) return
        fetchUnreadCount()
      }, 60_000)
    }

    const stop = () => {
      if (intervalId === null) return
      window.clearInterval(intervalId)
      intervalId = null
    }

    const handleVisibility = () => {
      if (document.hidden) stop()
      else start()
    }

    if (!document.hidden) start()
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      stop()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [user, fetchUnreadCount])

  useEffect(() => {
    if (!isNotificationsOpen) return
    fetchList({ page: 1, limit: 10 })
  }, [isNotificationsOpen, fetchList])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null
      if (!target) return

      if (isNotificationsOpen) {
        const clickedDesktop = notificationsRef.current && notificationsRef.current.contains(target)
        const clickedMobile = mobileNotificationsRef.current && mobileNotificationsRef.current.contains(target)
        if (!clickedDesktop && !clickedMobile) {
          setIsNotificationsOpen(false)
        }
      }

      if (isProfileOpen) {
        const clickedProfile = profileRef.current && profileRef.current.contains(target)
        if (!clickedProfile) {
          setIsProfileOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isNotificationsOpen, isProfileOpen])

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white dark:bg-zinc-900 border-r dark:border-zinc-800 sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-2 border-b dark:border-zinc-800">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-zinc-100">SUSU MGT.</span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                location.pathname === item.href
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t dark:border-zinc-800">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header & Menu */}
      <div className="flex-1 flex flex-col">
        <header className="md:hidden h-16 bg-white dark:bg-zinc-900 border-b dark:border-zinc-800 flex items-center justify-between px-4 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-lg">SUSU MGT.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 text-zinc-600 dark:text-zinc-400 relative"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900">
                  {unreadLabel}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-zinc-600 dark:text-zinc-400"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </header>

        {isNotificationsOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
            <div
              ref={mobileNotificationsRef}
              className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b dark:border-zinc-800">
                <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Notifications</div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await markAllRead()
                    }}
                    disabled={isMarkingAll}
                    className="rounded-full"
                  >
                    Mark all
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsNotificationsOpen(false)
                      navigate(notificationsPath)
                    }}
                    className="rounded-full"
                  >
                    View all
                  </Button>
                </div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto">
                {isLoadingList ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-14 bg-zinc-100 dark:bg-zinc-900 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : items.length === 0 ? (
                  <div className="p-6 text-sm text-zinc-500 dark:text-zinc-400">No notifications.</div>
                ) : (
                  <div className="divide-y dark:divide-zinc-800">
                    {items.map((n) => {
                      const isUnread = !n.readAt
                      return (
                        <button
                          key={n.id}
                          onClick={async () => {
                            if (isUnread) await markRead(n.id)
                          }}
                          className={cn(
                            'w-full text-left px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors',
                            isUnread && 'bg-blue-50/50 dark:bg-blue-900/10'
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                {n.subject ?? n.type}
                              </div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 overflow-hidden text-ellipsis whitespace-nowrap">
                                {n.message}
                              </div>
                            </div>
                            <div className="text-[10px] text-zinc-400 whitespace-nowrap">
                              {format(new Date(n.createdAt), 'MMM dd, HH:mm')}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-white dark:bg-zinc-950 pt-16">
            <nav className="p-4 space-y-2">
              {filteredItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 rounded-xl text-lg font-medium",
                    location.pathname === item.href
                      ? "bg-blue-600 text-white"
                      : "text-zinc-600 dark:text-zinc-400"
                  )}
                >
                  <item.icon className="h-6 w-6" />
                  {item.name}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-4 px-4 py-3 rounded-xl text-lg font-medium text-red-600"
              >
                <LogOut className="h-6 w-6" />
                Logout
              </button>
            </nav>
          </div>
        )}

        {/* Desktop Header / Top Bar */}
        <header className="hidden md:flex h-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b dark:border-zinc-800 items-center justify-between px-8 sticky top-0 z-30">
          <div className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            Welcome back, <span className="text-zinc-900 dark:text-zinc-100 font-bold">{user?.fullName}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 text-zinc-500 hover:text-blue-600 transition-colors relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900">
                    {unreadLabel}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b dark:border-zinc-800">
                    <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Notifications</div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          await markAllRead()
                        }}
                        disabled={isMarkingAll}
                        className="rounded-full"
                      >
                        Mark all as read
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(notificationsPath)}
                        className="rounded-full"
                      >
                        View all
                      </Button>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {isLoadingList ? (
                      <div className="p-4 space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="h-14 bg-zinc-100 dark:bg-zinc-900 rounded-xl animate-pulse" />
                        ))}
                      </div>
                    ) : items.length === 0 ? (
                      <div className="p-6 text-sm text-zinc-500 dark:text-zinc-400">
                        No notifications.
                      </div>
                    ) : (
                      <div className="divide-y dark:divide-zinc-800">
                        {items.map((n) => {
                          const isUnread = !n.readAt
                          return (
                            <button
                              key={n.id}
                              onClick={async () => {
                                if (isUnread) await markRead(n.id)
                              }}
                              className={cn(
                                'w-full text-left px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors',
                                isUnread && 'bg-blue-50/50 dark:bg-blue-900/10'
                              )}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                    {n.subject ?? n.type}
                                  </div>
                                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 overflow-hidden text-ellipsis whitespace-nowrap">
                                    {n.message}
                                  </div>
                                </div>
                                <div className="text-[10px] text-zinc-400 whitespace-nowrap">
                                  {format(new Date(n.createdAt), 'MMM dd, HH:mm')}
                                </div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs ring-offset-white transition-all hover:ring-2 hover:ring-blue-600 hover:ring-offset-2 dark:ring-offset-zinc-900 focus:outline-none"
              >
                {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </button>
              
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {user?.fullName}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                      {user?.email}
                    </p>
                  </div>
                  <div className="p-2 space-y-1">
                    {user?.role === 'CUSTOMER' && (
                      <Link
                        to="/customer/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors"
                      >
                        <User className="h-4 w-4" />
                        Edit Profile
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setIsProfileOpen(false)
                        handleLogout()
                      }}
                      className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
