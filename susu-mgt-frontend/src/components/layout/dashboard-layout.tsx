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
  Menu,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuthStore } from "@/store";
import { useNotifications, useUnreadCount, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/hooks/use-notifications";
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

export const sidebarItems: SidebarItem[] = [
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
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.unreadCount ?? 0;
  const { data: notificationsData, isLoading: isLoadingList } = useNotifications({ page: 1, limit: 10 });
  const items = notificationsData?.data || [];
  const markReadMutation = useMarkNotificationRead();
  const markAllMutation = useMarkAllNotificationsRead();
  const location = useLocation();
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  const [platformName, setPlatformName] = useState(() => {
    return localStorage.getItem("susu_platform_name") || "SUSU MGT.";
  });

  // Close mobile navigation menu layout on pathname route modifications
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

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
    navigate("/login");
  };



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

      if (isMobileMenuOpen) {
        const clickedMobileMenu =
          mobileMenuRef.current && mobileMenuRef.current.contains(target);
        if (!clickedMobileMenu) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNotificationsOpen, isProfileOpen, isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-[#070c1e] flex selection:bg-emerald-500/30 w-full relative">
      {/* Desktop Sidebar (Hidden completely on small mobile layouts) */}
      <aside className="hidden md:flex w-64 flex-col bg-[#0f1630] text-white sticky top-0 h-screen shadow-xl border-r border-white/5 shrink-0">
        <div className=" p-6 flex items-center gap-1  border-b border-white/5">
          <div className=" bg-blue-600 p-0 rounded-xl shadow-md transform -rotate-6">
            <img
              src="../src/assets/logo2.png"
              alt="logo"
              className="h-6 w-6 object-contain"
            />
          </div>
          <a
            href="/"
            className="font-bold text-md uppercase tracking-wider text-green-400 hover:text-blue-400 transition-colors"
          >
            {platformName}
          </a>
        </div>

        <nav className="text-xs flex-1 p-3 flex flex-col space-y-1 overflow-y-auto">
          {filteredItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group relative",
                location.pathname === item.href
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white",
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  location.pathname === item.href
                    ? "text-white"
                    : "text-zinc-500 group-hover:text-white",
                )}
              />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors group"
          >
            <LogOut className="h-4 w-4 text-red-500/60 group-hover:text-red-400 transition-colors" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Framework Content Body Viewport */}
      <div className="flex-1 flex flex-col min-w-0 w-full relative">
        {/* Universal Header / Top Nav Bar */}
        <header className="flex h-16 bg-[#0f1630] border-b border-white/5 items-center justify-between px-4 md:px-8 sticky top-0 z-40 shadow-sm w-full">
          {/* Left Layout Sector: Mobile Menu Trigger Icon */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex md:hidden p-2 text-zinc-400 hover:text-white transition-colors rounded-xl bg-white/5 border border-white/5 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <div className="text-xs sm:text-sm text-zinc-400 font-medium truncate max-w-[160px] sm:max-w-xs">
              Welcome back,{" "}
              <span className="text-white font-bold">{user?.fullName}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Desktop Notifications Action Popover Container */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 text-zinc-400 hover:text-white transition-colors relative rounded-full hover:bg-white/5"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-blue-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#0f1630] shadow-sm animate-pulse">
                    {unreadLabel}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0f1630] border border-white/5 text-white rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 ring-1 ring-black/10">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#0b1026]">
                    <div className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Notifications
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAllMutation.mutate()}
                        disabled={markAllMutation.isPending}
                        className="rounded-lg text-[10px] font-bold h-7 border-white/5 bg-[#141d3d] text-zinc-300 hover:bg-[#1c2957] hover:text-white transition-colors"
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
                        className="rounded-lg text-[10px] font-bold h-7 text-blue-400 hover:bg-white/5 transition-colors"
                      >
                        View all
                      </Button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-white/5 bg-[#0f1630]">
                    {isLoadingList ? (
                      <div className="p-4 space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="h-12 bg-[#141d3d] rounded-xl animate-pulse"
                          />
                        ))}
                      </div>
                    ) : items.length === 0 ? (
                      <div className="p-6 text-center text-xs text-zinc-500 font-medium">
                        No notifications found.
                      </div>
                    ) : (
                      items.map((n) => {
                        const isUnread = !n.readAt;
                        return (
                          <button
                            key={n.id}
                            onClick={async () => {
                              if (isUnread) markReadMutation.mutate(n.id);
                            }}
                            className={cn(
                              "w-full text-left px-4 py-3.5 hover:bg-[#131c3d]/40 transition-all duration-200 flex flex-col gap-1 relative",
                              isUnread &&
                                "bg-blue-500/5 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-blue-500",
                            )}
                          >
                            <div className="flex items-start justify-between gap-3 w-full">
                              <span
                                className={cn(
                                  "text-xs truncate flex-1 tracking-tight",
                                  isUnread
                                    ? "font-bold text-white"
                                    : "font-medium text-zinc-400",
                                )}
                              >
                                {n.subject ?? n.type}
                              </span>
                              <span className="text-[9px] font-medium text-zinc-500 shrink-0 mt-0.5">
                                {format(
                                  new Date(n.createdAt),
                                  "MMM dd • HH:mm",
                                )}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2 pr-2">
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
                className="h-8 w-8 rounded-full bg-[#141d3d] border border-white/5 flex items-center justify-center text-zinc-400 font-black text-xs ring-offset-[#0f1630] transition-all hover:text-emerald-400 hover:border-emerald-500/30 focus:outline-none"
              >
                {user?.fullName?.charAt(0) || user?.email?.charAt(0) || "U"}
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#0f1630] border border-white/5 text-white rounded-2xl shadow-2xl overflow-hidden z-50 ring-1 ring-black/10">
                  <div className="px-4 py-3 border-b border-white/5 bg-[#0b1026]">
                    <p className="text-xs font-bold text-white truncate tracking-tight">
                      {user?.fullName}
                    </p>
                    <p className="text-[10px] text-zinc-400 truncate mt-0.5 font-medium">
                      {user?.email}
                    </p>
                  </div>
                  <div className="p-1.5 space-y-0.5 bg-[#0f1630]">
                    <Link
                      to={`/${user?.role?.toLowerCase()}/profile`}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-[#141d3d] hover:text-emerald-400 rounded-xl transition-all duration-200 group"
                    >
                      <User className="h-4 w-4 text-zinc-500 group-hover:text-emerald-400 transition-colors shrink-0" />
                      Edit Profile
                    </Link>
                    {user?.role === "CUSTOMER" && (
                      <Link
                        to="/customer/addresses"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-[#141d3d] hover:text-emerald-400 rounded-xl transition-all duration-200 group"
                      >
                        <MapPin className="h-4 w-4 text-zinc-500 group-hover:text-emerald-400 transition-colors shrink-0" />
                        My Addresses
                      </Link>
                    )}
                    <div className="h-px bg-white/5 my-1 mx-1" />
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 group"
                    >
                      <LogOut className="h-4 w-4 text-red-500/60 group-hover:text-red-400 transition-colors shrink-0" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/**drop down on a smaller device */}
          {isMobileMenuOpen && (
            <div
              ref={mobileMenuRef}
              className="md:hidden absolute top-16 left-0 right-0 w-full bg-[#0f1630] text-white border-b border-white/5 shadow-2xl z-50 flex flex-col animate-in fade-in slide-in-from-top-4 duration-200 max-h-[calc(100vh-4rem)] overflow-y-auto"
            >
              <div className="p-4 flex items-center gap-3 border-b border-white/5 bg-[#0b1026]/60">
                <div className="bg-blue-600 p-2 rounded-xl shadow-md transform -rotate-6">
                  <img
                    src="../src/assets/logo2.png"
                    alt="logo"
                    className="h-5 w-5 object-contain"
                  />
                </div>
                <a
                  href="/"
                  className="font-bold text-sm uppercase tracking-wider text-white"
                >
                  {platformName}
                </a>
              </div>

              <nav className="p-3 flex flex-col space-y-1">
                {filteredItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200",
                      location.pathname === item.href
                        ? "bg-blue-600 text-white shadow-lg"
                        : "text-zinc-400 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.name}
                  </Link>
                ))}
              </nav>

              <div className="p-3 border-t border-white/5 bg-[#0b1026]/30">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4 text-red-500/60" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Primary Page Layout Inner Child Viewport Engine (Takes full screen space on mobile smoothly) */}
        <main className="flex-1 overflow-y-auto max-w-full">{children}</main>
      </div>
    </div>
  );
}
