













import { Link, useLocation, useNavigate } from "react-router-dom";
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
  Bell,
  Clock,
  ArrowLeftRight,
  Banknote,
  UserCog2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuthStore, useNotificationsStore } from "@/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { adminService } from "@/services/api/admin.service";

interface SidebarItem {
  name: string;
  href: string;
  icon: any;
  roles: ("ADMIN" | "CUSTOMER" | "WORKER")[];
}

const sidebarItems: SidebarItem[] = [
  // Customer items
  {
    name: "Dashboard",
    href: "/customer/dashboard",
    icon: LayoutDashboard,
    roles: ["CUSTOMER"],
  },
  {
    name: "Deposit",
    href: "/customer/deposit",
    icon: ArrowDownLeft,
    roles: ["CUSTOMER"],
  },
  {
    name: "Withdraw",
    href: "/customer/withdraw",
    icon: ArrowUpRight,
    roles: ["CUSTOMER"],
  },
  {
    name: "Transactions",
    href: "/customer/transactions",
    icon: ArrowLeftRight,
    roles: ["CUSTOMER"],
  },
  {
    name: "Profile",
    href: "/customer/profile",
    icon: User,
    roles: ["CUSTOMER"],
  },
  {
    name: "Addresses",
    href: "/customer/addresses",
    icon: MapPin,
    roles: ["CUSTOMER"],
  },

  // Worker items
  {
    name: "Dashboard",
    href: "/worker/dashboard",
    icon: LayoutDashboard,
    roles: ["WORKER"],
  },
  {
    name: "Clock In/Out",
    href: "/worker/clock-in-out",
    icon: Clock,
    roles: ["WORKER"],
  },
  {
    name: "Cash Deposit",
    href: "/worker/cash-deposit",
    icon: Wallet,
    roles: ["WORKER"],
  },
  {
    name: "Collections",
    href: "/worker/collection-history",
    icon: History,
    roles: ["WORKER"],
  },
  {
    name: "Withdrawal Requests",
    href: "/worker/withdrawal-requests",
    icon: Banknote,
    roles: ["WORKER"],
  },

  // Admin items
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN"],
  },
  {
    name: "User Management",
    href: "/admin/user-management",
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    name: "Worker Management",
    href: "/admin/worker-management",
    icon: UserCog2,
    roles: ["ADMIN"],
  },
  {
    name: "Wallet Management",
    href: "/admin/wallet-management",
    icon: Wallet,
    roles: ["ADMIN"],
  },
  {
    name: "User Approval",
    href: "/admin/user-approval",
    icon: UserCheck,
    roles: ["ADMIN"],
  },
  {
    name: "Transactions",
    href: "/admin/transaction-monitoring",
    icon: ArrowLeftRight,
    roles: ["ADMIN"],
  },
  {
    name: "Withdrawal Requests",
    href: "/admin/withdrawal-requests",
    icon: Banknote,
    roles: ["ADMIN"],
  },
  {
    name: "Audit Logs",
    href: "/admin/audit-logs",
    icon: History,
    roles: ["ADMIN"],
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
    roles: ["ADMIN"],
  },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
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
  } = useNotificationsStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);

  const [platformName, setPlatformName] = useState(() => {
    return localStorage.getItem("susu_platform_name") || "SUSU MGT.";
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem("susu_platform_name");
      if (stored) setPlatformName(stored);
    };
    window.addEventListener("platformNameChanged", handleStorageChange);
    return () => {
      window.removeEventListener("platformNameChanged", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const fetchPlatformName = async () => {
      try {
        const data = await adminService.getSettings();
        if (Array.isArray(data)) {
          const platSetting = data.find(
            (s: any) => s.settingKey === "platformName",
          );
          if (platSetting && platSetting.settingValue) {
            setPlatformName(platSetting.settingValue);
            localStorage.setItem(
              "susu_platform_name",
              platSetting.settingValue,
            );
          }
        }
      } catch (err) {
        // Safe check since non-admins cannot query settings
      }
    };
    if (user?.role === "ADMIN") {
      fetchPlatformName();
    }
  }, [user]);

  const filteredItems = sidebarItems.filter(
    (item) => user && item.roles.includes(user.role),
  );

  const notificationsPath = useMemo(() => {
    if (!user) return "/login";
    if (user.role === "CUSTOMER") return "/customer/notifications";
    if (user.role === "WORKER") return "/worker/notifications";
    return "/admin/notifications";
  }, [user]);

  const unreadLabel = unreadCount > 9 ? "9+" : String(unreadCount);

  const handleLogout = async () => {
    await logout();
    resetNotifications();
    navigate("/login");
  };

  useEffect(() => {
    if (!user) return;

    fetchUnreadCount();

    let intervalId: number | null = null;

    const start = () => {
      if (intervalId !== null) return;
      intervalId = window.setInterval(() => {
        if (document.hidden) return;
        fetchUnreadCount();
      }, 30_000);
    };

    const stop = () => {
      if (intervalId === null) return;
      window.clearInterval(intervalId);
      intervalId = null;
    };

    const handleVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    if (!document.hidden) start();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [user, fetchUnreadCount]);

  useEffect(() => {
    if (!isNotificationsOpen) return;
    fetchList({ page: 1, limit: 10 });
  }, [isNotificationsOpen, fetchList]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      if (isNotificationsOpen) {
        const clickedDesktop =
          notificationsRef.current && notificationsRef.current.contains(target);
        if (!clickedDesktop) {
          setIsNotificationsOpen(false);
        }
      }

      if (isProfileOpen) {
        const clickedProfile =
          profileRef.current && profileRef.current.contains(target);
        if (!clickedProfile) {
          setIsProfileOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNotificationsOpen, isProfileOpen]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex">
      {/* Desktop Sidebar (Hidden completely on small mobile layouts) */}
      <aside className="hidden md:flex w-64 flex-col bg-[#003366] text-white sticky top-0 h-screen shadow-xl">
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="bg-[#FFCC00] p-2 rounded-xl shadow-md transform -rotate-6">
            <img src="../src/assets/logo2.png" alt="logo" className="h-6 w-6 object-contain" />
          </div>
          <a
            href="/"
            className="font-black text-lg uppercase tracking-wider text-white hover:text-[#FFCC00] transition-colors"
          >
            {platformName}
          </a>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col space-y-1.5 overflow-y-auto">
          {filteredItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                location.pathname === item.href
                  ? "bg-[#FFCC00] text-[#003366] shadow-md scale-[1.02]"
                  : "text-blue-100 hover:bg-white/10 hover:text-white",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Framework Content Body Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Desktop Header / Top Nav Bar (Completely hidden on small screens) */}
        <header className="hidden md:flex h-16 bg-white dark:bg-zinc-900 border-b dark:border-zinc-800 items-center justify-between px-8 sticky top-0 z-40 shadow-sm">
          <div className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            Welcome back,{" "}
            <span className="text-[#003366] dark:text-zinc-100 font-black">
              {user?.fullName}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Desktop Notifications Action Popover Container */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 text-zinc-500 hover:text-[#003366] dark:hover:text-blue-400 transition-colors relative rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900 shadow-sm animate-pulse">
                    {unreadLabel}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white text-[#003366] border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div className="text-xs font-black uppercase tracking-wider text-[#002244] dark:text-zinc-100">
                      Notifications
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          await markAllRead();
                        }}
                        disabled={isMarkingAll}
                        className="rounded-lg text-[10px] font-bold h-7 border-zinc-200 text-[#003366] dark:text-white"
                      >
                        Mark read
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsNotificationsOpen(false);
                          navigate(notificationsPath);
                        }}
                        className="rounded-lg text-[10px] font-bold h-7 text-blue-600 dark:text-blue-400"
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
                        const isUnread = !n.readAt;
                        return (
                          <button
                            key={n.id}
                            onClick={async () => {
                              if (isUnread) await markRead(n.id);
                            }}
                            className={cn(
                              "w-full text-left px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors flex flex-col gap-0.5",
                              isUnread && "bg-blue-50/40 dark:bg-blue-900/10",
                            )}
                          >
                            <div className="flex items-start justify-between gap-3 w-full">
                              <span className="text-xs font-black text-[#002244] dark:text-zinc-100 truncate flex-1">
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
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop User Dropdown Wrapper */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="h-8 w-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[#003366] font-black text-xs ring-offset-white transition-all hover:ring-2 hover:ring-[#003366] hover:ring-offset-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:outline-none"
              >
                {user?.fullName?.charAt(0) || user?.email?.charAt(0) || "U"}
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-200 text-[#003366] dark:bg-zinc-950 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <p className="text-xs font-black text-[#002244] dark:text-zinc-100 truncate">
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
                        setIsProfileOpen(false);
                        handleLogout();
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
          </div>
        </header>

        {/* Primary Page Layout Inner Child Viewport Engine (Takes full screen space on mobile smoothly) */}
        <main className="flex-1 p-0 md:p-8 overflow-y-auto max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}