import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../assets/logo2.png";
import { Menu, X, ArrowRight, LayoutDashboard, User, LogOut, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { user, isAuthenticated, logout } = useAuthStore();

  // Derive role-based dashboard & profile paths
  const dashboardPath = user
    ? `/${user.role.toLowerCase()}/dashboard`
    : "/login";
  const profilePath = user
    ? `/${user.role.toLowerCase()}/profile`
    : "/login";

  // Generate initials for the avatar
  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  // Track page scroll to apply dynamic styling (glass intensity)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close avatar dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setAvatarOpen(false);
    setIsOpen(false);
    await logout();
    navigate("/");
  };

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "About Us", href: "#about-us" },
    { name: "Savings", href: "#services" },
    { name: "Loans", href: "#loans" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "border-b border-emerald-500/20 bg-[#05080a]/85 backdrop-blur-xl py-3 shadow-[0_10px_40px_rgba(16,185,129,0.1)]"
          : "bg-transparent py-5"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6">
        {/* Brand Logo & Wordmark */}
        <motion.div
          className="flex items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <a
            href="#home"
            className="group flex items-center gap-3 transition-all duration-300 active:scale-95"
          >
            <div className="relative">
              <img
                className="h-9 w-auto md:h-11 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110"
                src={logo}
                alt="Unique Capital Logo"
              />
              {/* Dynamic backglow for logo */}
              <motion.div
                className="absolute -inset-2 -z-10 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/10 blur-lg"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-bold tracking-tight text-white sm:text-xl">
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                  UNIQUE
                </span>{" "}
                <span className="font-semibold text-slate-200 group-hover:text-white transition-colors duration-300">
                  CAPITAL
                </span>
              </p>
            </div>
          </a>
        </motion.div>

        {/* Desktop Navigation Links */}
        <motion.ul
          className="hidden items-center gap-1 lg:flex"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {navLinks.map((link) => (
            <motion.li
              key={link.name}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="group relative"
            >
              <a
                href={link.href}
                className="relative px-4 py-2 text-sm font-semibold text-slate-300 transition-all duration-300 group-hover:text-emerald-300"
              >
                {link.name}
                {/* Underline animation */}
                <motion.div
                  className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </a>
            </motion.li>
          ))}
        </motion.ul>

        {/* Action CTAs */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {isAuthenticated && user ? (
            /* ── Logged-in: Avatar dropdown ── */
            <div className="relative hidden lg:block" ref={avatarRef}>
              <motion.button
                id="header-avatar-btn"
                onClick={() => setAvatarOpen((v) => !v)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2.5 rounded-full border border-emerald-500/30 bg-white/5 px-3 py-1.5 text-slate-200 transition-all duration-300 hover:border-emerald-400/50 hover:bg-emerald-500/10 focus:outline-none"
                aria-label="Account menu"
              >
                {/* Avatar circle */}
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.fullName}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-emerald-500/40"
                  />
                ) : (
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-xs font-bold text-slate-950 ring-2 ring-emerald-500/40">
                    {initials}
                    <motion.div
                      className="absolute inset-0 rounded-full bg-white/10"
                      animate={{ opacity: [0, 0.2, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    />
                  </div>
                )}
                <span className="max-w-[110px] truncate text-sm font-semibold">
                  {user.fullName.split(" ")[0]}
                </span>
                <motion.div
                  animate={{ rotate: avatarOpen ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <ChevronDown size={14} className="text-emerald-400" />
                </motion.div>
              </motion.button>

              {/* Dropdown panel */}
              <AnimatePresence>
                {avatarOpen && (
                  <motion.div
                    id="header-avatar-dropdown"
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-emerald-500/20 bg-[#0a0e18]/95 shadow-[0_20px_60px_rgba(16,185,129,0.2)] backdrop-blur-xl"
                  >
                    {/* User info header */}
                    <div className="border-b border-white/5 px-4 py-3">
                      <p className="text-sm font-semibold text-white truncate">
                        {user.fullName}
                      </p>
                      <p className="text-xs text-emerald-400/80 truncate">
                        {user.email}
                      </p>
                      <span className="mt-1 inline-block rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        {user.role}
                      </span>
                    </div>

                    {/* Menu items */}
                    <div className="py-1.5">
                      <Link
                        to={dashboardPath}
                        onClick={() => setAvatarOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 transition-all duration-200 hover:bg-emerald-500/10 hover:text-emerald-300"
                      >
                        <LayoutDashboard size={15} className="text-emerald-400" />
                        My Dashboard
                      </Link>
                      <Link
                        to={profilePath}
                        onClick={() => setAvatarOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 transition-all duration-200 hover:bg-emerald-500/10 hover:text-emerald-300"
                      >
                        <User size={15} className="text-emerald-400" />
                        My Profile
                      </Link>
                    </div>

                    {/* Sign out */}
                    <div className="border-t border-white/5 py-1.5">
                      <button
                        id="header-logout-btn"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-rose-400 transition-all duration-200 hover:bg-rose-500/10 hover:text-rose-300"
                      >
                        <LogOut size={15} />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* ── Guest: Sign In / Get Started ── */
            <div className="hidden items-center gap-4 lg:flex">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/login"
                  className="relative px-5 py-2.5 text-sm font-semibold text-slate-200 transition-all duration-300 hover:text-emerald-300"
                >
                  Sign In
                  <motion.div
                    className="absolute bottom-1 left-5 right-5 h-px bg-gradient-to-r from-emerald-400 to-transparent rounded-full"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/register"
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-slate-950 transition-all duration-300 hover:from-emerald-400 hover:to-teal-400 shadow-[0_4px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.4)]"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <ArrowRight size={16} />
                    </motion.div>
                  </span>
                  <motion.div
                    className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 transition-opacity group-hover:opacity-100"
                    initial={false}
                  />
                </Link>
              </motion.div>
            </div>
          )}

          {/* Touch-Friendly Mobile Hamburger Button */}
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.15)" }}
            whileTap={{ scale: 0.9 }}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-500/30 bg-white/5 text-slate-200 transition-all lg:hidden"
          >
            {isOpen ? (
              <motion.div initial={{ rotate: 0 }} animate={{ rotate: 90 }} exit={{ rotate: 0 }}>
                <X size={20} className="text-emerald-400" />
              </motion.div>
            ) : (
              <motion.div initial={{ rotate: 90 }} animate={{ rotate: 0 }} exit={{ rotate: 90 }}>
                <Menu size={20} />
              </motion.div>
            )}
          </motion.button>
        </motion.div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="absolute left-0 w-full overflow-hidden bg-gradient-to-b from-[#05080a]/95 via-[#0a0e18]/90 to-[#05080a]/95 backdrop-blur-xl border-b border-emerald-500/20 lg:hidden shadow-[0_20px_50px_rgba(16,185,129,0.15)]"
          >
            <ul className="flex flex-col space-y-1 px-6 py-8">
              {navLinks.map((link, idx) => (
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.08 }}
                  key={link.name}
                  className="group"
                >
                  <a
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 text-base font-semibold text-slate-300 transition-all duration-300 hover:translate-x-2 hover:text-emerald-300 rounded-lg hover:bg-white/5"
                  >
                    {link.name}
                  </a>
                </motion.li>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: navLinks.length * 0.08 }}
                className="w-full flex flex-col gap-3 pt-6 mt-4 border-t border-white/5"
              >
                {isAuthenticated && user ? (
                  /* Mobile: logged-in user section */
                  <>
                    {/* Mini user card */}
                    <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-white/5 px-4 py-3">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user.fullName}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-500/40 shrink-0"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-sm font-bold text-slate-950 ring-2 ring-emerald-500/40">
                          {initials}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {user.fullName}
                        </p>
                        <p className="truncate text-xs text-emerald-400/80">{user.email}</p>
                      </div>
                    </div>

                    <Link
                      to={dashboardPath}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition-all duration-300 hover:bg-emerald-500/10 hover:text-emerald-300"
                    >
                      <LayoutDashboard size={16} className="text-emerald-400" />
                      My Dashboard
                    </Link>
                    <Link
                      to={profilePath}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition-all duration-300 hover:bg-emerald-500/10 hover:text-emerald-300"
                    >
                      <User size={16} className="text-emerald-400" />
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm font-semibold text-rose-400 transition-all duration-300 hover:bg-rose-500/10 hover:text-rose-300"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  /* Mobile: guest CTAs */
                  <>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
                      <Link
                        to="/login"
                        onClick={() => setIsOpen(false)}
                        className="block w-full rounded-full border border-emerald-500/30 bg-white/5 px-6 py-3 text-center text-sm font-semibold text-slate-200 transition-all duration-300 hover:bg-emerald-500/10 hover:text-emerald-300"
                      >
                        Sign In
                      </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
                      <Link
                        to="/register"
                        onClick={() => setIsOpen(false)}
                        className="block w-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-center text-sm font-bold text-slate-950 shadow-[0_4px_24px_rgba(16,185,129,0.3)] transition-all duration-300 hover:from-emerald-400 hover:to-teal-400"
                      >
                        Get Started
                      </Link>
                    </motion.div>
                  </>
                )}
              </motion.div>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
