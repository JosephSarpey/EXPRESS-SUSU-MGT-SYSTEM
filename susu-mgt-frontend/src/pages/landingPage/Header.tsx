import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../assets/logo2.png";
import { Menu, X, ArrowRight } from "lucide-react";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Track page scroll to apply dynamic styling (glass intensity)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
          ? "border-b border-white/5 bg-[#05080a]/80 backdrop-blur-md py-3 shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
          : "bg-transparent py-5"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6">
        {/* Brand Logo & Wordmark */}
        <div className="flex items-center">
          <a
            href="#home"
            className="flex items-center gap-2.5 transition-transform active:scale-95 group"
          >
            <div className="relative">
              <img
                className="h-9 w-auto md:h-10 transition-transform duration-500 group-hover:rotate-12"
                src={logo}
                alt="Express Capital Logo"
              />
              {/* Subtle backglow for logo */}
              <div className="absolute -inset-1 -z-10 rounded-full bg-emerald-500/10 opacity-0 blur-sm transition-opacity group-hover:opacity-100" />
            </div>
            <p className="text-lg font-bold tracking-tight text-white sm:text-xl">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                UNIQUE
              </span>{" "}
              <span className="font-medium text-slate-300 group-hover:text-white transition-colors">
                CAPITAL
              </span>
            </p>
          </a>
        </div>

        {/* Desktop Navigation Links */}
        <ul className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link, idx) => (
            <motion.li
              key={link.name}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="relative"
            >
              <a
                href={link.href}
                className="text-[14px] font-medium text-slate-400 transition-all duration-300 hover:text-emerald-400"
              >
                {link.name}
              </a>
            </motion.li>
          ))}
        </ul>

        {/* Action CTAs (Sign In / Register) */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-6 lg:flex">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-300 transition-colors hover:text-emerald-400"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 transition-all hover:bg-emerald-400 active:scale-95"
            >
              <span className="relative z-10">Get Started</span>
              <ArrowRight
                size={16}
                className="relative z-10 transition-transform group-hover:translate-x-1"
              />
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          </div>

          {/* Touch-Friendly Mobile Hamburger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition-all hover:bg-white/10 active:scale-90 lg:hidden"
          >
            {isOpen ? (
              <X size={20} className="text-[#d2b4fe]" />
            ) : (
              <Menu size={20} />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer (Framer Motion Animated) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="absolute left-0 w-full overflow-hidden bg-[#05080a]/95 backdrop-blur-lg border-b border-white/5 lg:hidden shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
          >
            <ul className="flex flex-col space-y-2 px-6 py-8">
              {navLinks.map((link, idx) => (
                <motion.li
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: idx * 0.05 }}
                  key={link.name}
                  className="border-b border-white/5"
                >
                  <a
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block py-4 text-[16px] font-medium text-slate-300 transition-all hover:translate-x-2 hover:text-emerald-400"
                  >
                    {link.name}
                  </a>
                </motion.li>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: navLinks.length * 0.05 }}
                className="flex flex-col gap-3 pt-6"
              >
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full rounded-full border border-white/10 bg-white/5 py-3.5 text-center text-sm font-semibold text-white hover:bg-white/10"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full rounded-full bg-emerald-500 py-3.5 text-center text-sm font-bold text-slate-950 shadow-[0_4px_20px_rgba(16,185,129,0.3)]"
                >
                  Get Started
                </Link>
              </motion.div>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
