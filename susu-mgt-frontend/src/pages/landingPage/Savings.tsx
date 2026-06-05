import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PiggyBank,
  Lock,
  Smile,
  Briefcase,
  AlertCircle,
  TrendingUp,
  Calculator,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface SavingProduct {
  title: string;
  icon: any;
  description: string;
  badge?: string;
}

const Savings = () => {
  const savingsData: SavingProduct[] = [
    {
      title: "Regular Savings",
      icon: PiggyBank,
      badge: "Popular",
      description: "A flexible and secure daily/weekly savings plan that helps you build consistent financial discipline while keeping your money highly accessible.",
    },
    {
      title: "Fixed Savings",
      icon: Lock,
      badge: "High Yield",
      description: "Lock away a specific amount for a chosen tenure and earn premium, guaranteed interest rates. Perfect for big, planned future expenses.",
    },
    {
      title: "Children’s Savings",
      icon: Smile,
      description: "Secure your children's future education and welfare. Start saving early for them with specialized accounts and long-term security.",
    },
    {
      title: "Business Savings",
      icon: Briefcase,
      description: "Designed for SMEs and market traders. Safe custody of your daily business revenues with easy access and interest to support business growth.",
    },
    {
      title: "Emergency Savings",
      icon: AlertCircle,
      description: "Prepare for life's unexpected moments. Build a dedicated safety net with instant access to your funds whenever an emergency strikes.",
    },
    {
      title: "Investment Savings",
      icon: TrendingUp,
      badge: "Wealth Builder",
      description: "Put your money to work. Benefit from curated investment portfolios and higher returns aligned with your long-term wealth goals.",
    },
  ];

  // Calculator State
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [amount, setAmount] = useState<number>(50);
  const [term, setTerm] = useState<number>(6); // in months

  // Carousel auto-slide states & Ref
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -340, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 340, behavior: "smooth" });
    }
  };

  // Auto-slide effect
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft: currentScroll, scrollWidth, clientWidth } = carouselRef.current;
        // If we are at the end, wrap back to the start. Otherwise, scroll right.
        const targetScroll = currentScroll + clientWidth >= scrollWidth - 10
          ? 0
          : currentScroll + 340;

        carouselRef.current.scrollTo({
          left: targetScroll,
          behavior: "smooth",
        });
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Set default values based on frequency
  useEffect(() => {
    if (frequency === "daily") {
      setAmount(20);
    } else if (frequency === "weekly") {
      setAmount(100);
    } else {
      setAmount(400);
    }
  }, [frequency]);

  // Limits based on frequency
  const amountLimits = {
    daily: { min: 5, max: 200, step: 5 },
    weekly: { min: 20, max: 1000, step: 10 },
    monthly: { min: 100, max: 5000, step: 50 },
  };

  // Calculations (Simplified: Removed Savings Growth Bonus interest rate entirely)
  const currentLimits = amountLimits[frequency];
  const periodsPerMonth = frequency === "daily" ? 30.4 : frequency === "weekly" ? 4.33 : 1;
  const totalDeposits = Math.round(amount * (term * periodsPerMonth));

  return (
    <section className="relative py-20 overflow-hidden" id="services" style={{ backgroundColor: "#05080a" }}>
      {/* Background decoration elements */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        
        {/* CAROUSEL HEADER BLOCK */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <motion.span
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-[11px] font-mono tracking-[0.25em] text-emerald-400 uppercase block mb-3 font-semibold"
            >
              // 01 . Susu savings products
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Susu Plans Built For{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                Your Ambitions
              </span>
            </motion.h2>
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={scrollLeft}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#0a0f12]/60 text-slate-300 hover:border-emerald-400 hover:text-emerald-400 transition-all active:scale-90"
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={scrollRight}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#0a0f12]/60 text-slate-300 hover:border-emerald-400 hover:text-emerald-400 transition-all active:scale-90"
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* HORIZONTALLY SLIDING CAROUSEL */}
        <div className="relative mb-24">
          <div
            ref={carouselRef}
            className="flex overflow-x-auto gap-6 snap-x snap-mandatory scrollbar-none pb-6 px-1 scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {savingsData.map((saving, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="glass-card relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-[#0a0f12]/60 p-6 sm:p-8 transition-colors hover:border-emerald-500/20 snap-start shrink-0 w-[290px] sm:w-[350px] min-h-[250px]"
              >
                {saving.badge && (
                  <span className="absolute top-4 right-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    {saving.badge}
                  </span>
                )}
                <div>
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 text-emerald-400 border border-emerald-500/20">
                    <saving.icon size={22} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {saving.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-400 mb-6">
                    {saving.description}
                  </p>
                </div>
                <div className="flex items-center text-xs font-semibold text-emerald-400 group cursor-pointer hover:text-emerald-300 mt-auto">
                  Learn More
                  <ArrowRight size={14} className="ml-1.5 transition-transform group-hover:translate-x-1" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* INTERACTIVE CALCULATOR SECTION */}
        <div className="relative glass-card border border-white/5 bg-[#0a0f12]/40 rounded-3xl p-6 sm:p-10 lg:p-12">
          {/* Decorative Glow inside Calculator */}
          <div className="absolute top-0 right-0 -z-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -z-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />

          <div className="grid gap-12 lg:grid-cols-12 items-center">
            
            {/* CALCULATOR CONTROLS (Left side) */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-2">
                <Calculator size={18} />
                Interactive Susu Estimator
              </div>
              <h3 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Calculate Your Savings Growth
              </h3>

              {/* Frequency Selector */}
              <div className="mb-8">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">
                  How often do you want to save?
                </label>
                <div className="inline-flex rounded-xl bg-white/5 p-1 border border-white/5 w-full sm:w-auto">
                  {(["daily", "weekly", "monthly"] as const).map((freq) => (
                    <button
                      key={freq}
                      onClick={() => setFrequency(freq)}
                      className={`flex-1 sm:flex-initial rounded-lg px-6 py-2.5 text-xs font-bold capitalize transition-all ${
                        frequency === freq
                          ? "bg-emerald-500 text-slate-950 shadow-[0_4px_12px_rgba(16,185,129,0.2)]"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Slider */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Contribution Amount
                  </label>
                  <span className="text-lg font-bold text-emerald-400">
                    GH₵ {amount.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min={currentLimits.min}
                  max={currentLimits.max}
                  step={currentLimits.step}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-white/10 accent-emerald-500"
                  style={{
                    background: `linear-gradient(to right, #10b981 0%, #10b981 ${
                      ((amount - currentLimits.min) / (currentLimits.max - currentLimits.min)) * 100
                    }%, rgba(255,255,255,0.1) ${
                      ((amount - currentLimits.min) / (currentLimits.max - currentLimits.min)) * 100
                    }%, rgba(255,255,255,0.1) 100%)`,
                  }}
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-medium mt-2">
                  <span>GH₵ {currentLimits.min}</span>
                  <span>GH₵ {currentLimits.max}</span>
                </div>
              </div>

              {/* Term Slider */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Savings Term (Months)
                  </label>
                  <span className="text-lg font-bold text-emerald-400">
                    {term} Months
                  </span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="24"
                  step="1"
                  value={term}
                  onChange={(e) => setTerm(Number(e.target.value))}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-white/10 accent-emerald-500"
                  style={{
                    background: `linear-gradient(to right, #10b981 0%, #10b981 ${
                      ((term - 3) / 21) * 100
                    }%, rgba(255,255,255,0.1) ${
                      ((term - 3) / 21) * 100
                    }%, rgba(255,255,255,0.1) 100%)`,
                  }}
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-medium mt-2">
                  <span>3 Months</span>
                  <span>12 Months</span>
                  <span>24 Months</span>
                </div>
              </div>
            </div>

            {/* ESTIMATED OUTPUTS (Right side) */}
            <div className="lg:col-span-5 bg-white/5 border border-white/5 rounded-2xl p-6 sm:p-8 flex flex-col justify-between h-full">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
                  Estimated Summary
                </h4>

                {/* Total Deposit */}
                <div className="flex justify-between items-center py-3 border-b border-white/5 mb-8">
                  <span className="text-sm text-slate-400">Total Contribution</span>
                  <span className="text-base font-semibold text-white">
                    GH₵ {totalDeposits.toLocaleString()}
                  </span>
                </div>

                {/* Total Payout */}
                <div className="mt-8 mb-8">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Total Savings Goal
                  </p>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={totalDeposits}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.2 }}
                      className="text-3xl sm:text-4xl font-extrabold text-white"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      GH₵ {totalDeposits.toLocaleString()}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>

              {/* Action Button */}
              <button className="w-full group flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-4 text-sm font-bold text-slate-950 shadow-[0_4px_16px_rgba(16,185,129,0.2)] transition-all hover:bg-emerald-400 hover:shadow-[0_4px_24px_rgba(16,185,129,0.35)] active:scale-98">
                Start Saving towards GH₵ {totalDeposits.toLocaleString()}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default Savings;