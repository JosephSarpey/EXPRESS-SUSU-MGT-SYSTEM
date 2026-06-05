import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../assets/logo2.jpg";
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
                alt="Express Capital Logo"
              />
              {/* Dynamic backglow for logo */}
              <motion.div
                className="absolute -inset-2 -z-10 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/10 blur-lg"
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                }}
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

        {/* Action CTAs (Sign In / Register) */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
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

          {/* Touch-Friendly Mobile Hamburger Button */}
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.15)" }}
            whileTap={{ scale: 0.9 }}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-500/30 bg-white/5 text-slate-200 transition-all lg:hidden"
          >
            {isOpen ? (
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 90 }}
                exit={{ rotate: 0 }}
              >
                <X size={20} className="text-emerald-400" />
              </motion.div>
            ) : (
              <motion.div
                initial={{ rotate: 90 }}
                animate={{ rotate: 0 }}
                exit={{ rotate: 90 }}
              >
                <Menu size={20} />
              </motion.div>
            )}
          </motion.button>
        </motion.div>
      </nav>

      {/* Mobile Menu Drawer (Framer Motion Animated) */}
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
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full"
                >
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block w-full rounded-full border border-emerald-500/30 bg-white/5 px-6 py-3 text-center text-sm font-semibold text-slate-200 transition-all duration-300 hover:bg-emerald-500/10 hover:text-emerald-300"
                  >
                    Sign In
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full"
                >
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="block w-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-center text-sm font-bold text-slate-950 shadow-[0_4px_24px_rgba(16,185,129,0.3)] transition-all duration-300 hover:from-emerald-400 hover:to-teal-400"
                  >
                    Get Started
                  </Link>
                </motion.div>
              </motion.div>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
