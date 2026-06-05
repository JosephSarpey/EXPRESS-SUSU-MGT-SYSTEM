import { useState } from "react";
import {
  Send,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Sparkles,
} from "lucide-react";
import logo from "../../assets/logo2.jpg";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const socialLinks = [
    { label: "Instagram", href: "https://instagram.com", icon: Instagram },
    { label: "Facebook", href: "https://facebook.com", icon: Facebook },
    { label: "Twitter", href: "https://x.com", icon: Twitter },
    { label: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer
      className="relative border-t border-white/5 pt-20 pb-12 overflow-hidden"
      style={{ backgroundColor: "#040709" }}
    >
      {/* Background decoration */}
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Main Grid */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12 mb-16">
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2 mb-6">
              <img
                src={logo}
                alt="Express Capital Logo"
                className="w-10 h-10"
              />
              <p className="text-lg font-bold tracking-tight text-white">
                <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  UNIQUE
                </span>{" "}
                <span className="font-medium text-slate-300 group-hover:text-white transition-colors">
                  CAPITAL
                </span>
              </p>
            </div>
            <p className="text-sm leading-relaxed text-slate-400 mb-6">
              Empowering individuals and small scale businesses with flexible
              Susu savings schemes, instant payouts, and reliable micro-loans.
              Building financial security, together.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 hover:border-emerald-400 hover:text-emerald-400 transition-all hover:bg-emerald-500/5 active:scale-95"
                >
                  <item.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-6">
              Susu Products
            </h4>
            <ul className="space-y-3.5 text-sm">
              {[
                "Regular Savings",
                "Fixed Savings",
                "Children's Savings",
                "Business Savings",
              ].map((item, idx) => (
                <li key={idx}>
                  <a
                    href="#services"
                    className="text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-6">
              Company
            </h4>
            <ul className="space-y-3.5 text-sm">
              {[
                "About Us",
                "Lending Schemes",
                "Success Stories",
                "Contact Support",
              ].map((item, idx) => (
                <li key={idx}>
                  <a
                    href={
                      item === "About Us"
                        ? "#about-us"
                        : item === "Contact Support"
                          ? "#contact"
                          : "#"
                    }
                    className="text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="lg:col-span-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-6">
              Stay Updated
            </h4>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              Subscribe to get financial tips, new plan rollouts, and interest
              bonus updates.
            </p>
            <form
              onSubmit={handleSubscribe}
              className="relative flex items-center"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-xl border border-white/10 bg-white/5 pl-4 pr-12 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500/50 focus:bg-white/10 focus:outline-none transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 transition-all hover:bg-emerald-400 active:scale-95"
              >
                {subscribed ? <Sparkles size={16} /> : <Send size={15} />}
              </button>
            </form>
            {subscribed && (
              <p className="mt-2 text-xs font-medium text-emerald-400">
                Thanks for subscribing! Check your inbox soon.
              </p>
            )}
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} UNIQUE CAPITAL. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5">
            Designed by
            <a
              href="#"
              className="text-slate-400 hover:text-emerald-400 transition-colors font-medium"
            >
              Startech
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
