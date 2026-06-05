import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";
import heroBg from "../../assets/hero_3d_bg.jpg";

const HeroSection = () => {
  return (
    <section
      className="relative min-h-screen overflow-hidden pt-28 pb-16 md:pt-36 lg:pt-40"
      id="home"
      style={{ backgroundColor: "#05080a" }}
    >
      {/* 3D Fintech Background Image with soft entry animation */}
      <motion.div
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.22 }}
        transition={{ duration: 2, ease: "easeOut" }}
      >
        <img
          src={heroBg}
          alt="3D Fintech Backdrop"
          className="w-full h-full object-cover"
        />
        {/* Soft dark masks to blend the asset seamlessly into the obsidian layout */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05080a] via-transparent to-[#05080a]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#05080a] via-transparent to-[#05080a]" />
      </motion.div>

      {/* Background glow blobs */}
      <div className="glow-blob absolute -top-32 -left-32 h-[500px] w-[500px] bg-emerald-500" />
      <div className="glow-blob absolute top-1/2 -right-48 h-[400px] w-[400px] bg-teal-600" />
      <div className="glow-blob absolute bottom-0 left-1/3 h-[300px] w-[300px] bg-teal-500" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
          {/* LEFT COLUMN — Headlines & CTAs */}
          <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[3.5rem] xl:text-[4rem]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Savings that{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                grow
              </span>{" "}
              with you.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-5 max-w-md text-base leading-relaxed text-slate-400 sm:text-lg"
            >
              Simple, reliable, and flexible Susu savings and financial services
              designed for every Ghanaian — from daily contributions to
              emergency funds.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:w-auto"
            >
              <Link
                to="/register"
                className="group flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-7 py-3.5 text-sm font-bold text-slate-950 shadow-[0_4px_24px_rgba(16,185,129,0.3)] transition-all hover:bg-emerald-400 hover:shadow-[0_4px_32px_rgba(16,185,129,0.45)] active:scale-95"
              >
                Start Saving Now
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              <a
                href="#services"
                className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-medium text-white transition-all hover:bg-white/10 active:scale-95"
              >
                Explore Products
              </a>
            </motion.div>

            {/* Social proof pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.65 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-6 lg:justify-start"
            >
              {[
                { icon: TrendingUp, label: "20+ Years of Service" },
                { icon: Shield, label: "Secure & Licensed" },
                { icon: Zap, label: "Instant Deposits" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-xs font-medium text-slate-500"
                >
                  <item.icon size={14} className="text-emerald-500/70" />
                  {item.label}
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT COLUMN — Animated Mock Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
            className="relative flex flex-1 justify-center lg:justify-end"
          >
            {/* Main Dashboard Card */}
            <div className="relative w-full max-w-sm sm:max-w-md">
              {/* Backglow behind card */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-transparent to-emerald-500/5 blur-2xl" />

              <div className="glass-card relative rounded-2xl p-6 sm:p-8">
                {/* Dashboard Header */}
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Total Savings
                    </p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                      className="mt-1 text-3xl font-bold text-white sm:text-4xl"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      GH₵ 12,450
                    </motion.p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                    <TrendingUp size={20} className="text-emerald-400" />
                  </div>
                </div>

                {/* Mini chart bars */}
                <div className="mb-6 flex items-end gap-1.5">
                  {[35, 50, 40, 65, 55, 80, 70, 90, 75, 95, 85, 100].map(
                    (h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 0.6, delay: 0.6 + i * 0.05 }}
                        className="flex-1 rounded-sm bg-gradient-to-t from-emerald-500/40 to-emerald-400/80"
                        style={{ maxHeight: `${h * 0.6}px`, minHeight: 4 }}
                      />
                    ),
                  )}
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "This Month", value: "GH₵ 1,200", change: "+12%" },
                    { label: "Streak", value: "28 Days", change: "🔥" },
                    { label: "Goal", value: "85%", change: "On Track" },
                  ].map((stat, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0 + idx * 0.1, duration: 0.4 }}
                      className="rounded-xl bg-white/5 px-3 py-3 text-center"
                    >
                      <p className="text-[10px] font-medium text-slate-500">
                        {stat.label}
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-white">
                        {stat.value}
                      </p>
                      <p className="mt-0.5 text-[10px] font-medium text-emerald-400">
                        {stat.change}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#05080a] to-transparent" />
    </section>
  );
};

export default HeroSection;
