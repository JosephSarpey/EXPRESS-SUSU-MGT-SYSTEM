import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo2.png";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "About Us", href: "#portfolio" },
    { name: "Loans", href: "#about" },
    { name: "Savings", href: "#services" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <a
            href="#home"
            className="flex items-center gap-2 transition-transform active:scale-95"
          >
            <img className="h-8 w-auto md:h-10" src={logo} alt="Logo" />
            <p className="text-sm font-bold tracking-tighter text-white sm:text-xl">
              <span className="text-green-400">EXPRESS</span> CAPITAL
            </p>
          </a>
        </div>

        {/* Desktop Nav List */}
        <ul className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <li key={link.name} className="group relative">
              <a
                href={link.href}
                className="block py-2 text-sm font-medium text-gray-300 transition-all duration-300 group-hover:scale-110 group-hover:text-green-400"
              >
                {link.name}
              </a>
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-green-400 transition-all duration-300 group-hover:w-full"></span>
            </li>
          ))}
        </ul>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-4 sm:flex">
            <Link
              to="/login"
              className="text-sm font-semibold text-white transition-colors hover:text-green-400"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-green-500 px-6 py-2 text-sm font-bold text-black transition-all hover:bg-green-400 hover:shadow-[0_0_15px_rgba(74,222,128,0.4)] active:scale-95"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Toggle Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative z-50 rounded-md p-2 text-white hover:bg-white/10 lg:hidden"
          >
            {isOpen ? (
              <X size={28} className="text-green-400" />
            ) : (
              <Menu size={28} />
            )}
          </button>
        </div>
      </nav>

      {/* Smooth Dropdown Menu */}
      <div
        className={`absolute left-0 w-full overflow-hidden bg-[#0f0f0f] transition-all duration-500 ease-in-out lg:hidden ${
          isOpen
            ? "max-h-[450px] opacity-100 border-b border-white/10"
            : "max-h-0 opacity-0"
        }`}
      >
        <ul className="flex flex-col space-y-2 p-6">
          {navLinks.map((link) => (
            <li key={link.name} className="border-b border-white/5">
              <a
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block py-3 text-lg font-medium text-gray-300 transition-all hover:translate-x-2 hover:text-green-400"
              >
                {link.name}
              </a>
            </li>
          ))}
          <div className="flex flex-col gap-4 pt-4">
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="w-full rounded-lg border border-green-400 py-3 text-center font-semibold text-green-400"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              onClick={() => setIsOpen(false)}
              className="w-full rounded-lg bg-green-500 py-3 text-center font-bold text-gray-200"
            >
              Get Started
            </Link>
          </div>
        </ul>
      </div>
    </header>
  );
};

export default Header;
