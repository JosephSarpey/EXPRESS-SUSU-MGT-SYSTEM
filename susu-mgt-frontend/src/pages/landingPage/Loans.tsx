import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Store,
  Coins,
  GraduationCap,
  Building2,
  Home,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface LoanProduct {
  title: string;
  icon: any;
  description: string;
  badge?: string;
}

const Loans = () => {
  const loanData: LoanProduct[] = [
    {
      title: "Personal Loan",
      icon: User,
      description:
        "Quick, low-interest funding for your immediate personal milestones, medical bills, or travel plans.",
    },
    {
      title: "SME Loan",
      icon: Store,
      badge: "Popular",
      description:
        "Tailored working capital and inventory financing to help small and medium enterprises scale dynamically.",
    },
    {
      title: "Salary Advance",
      icon: Coins,
      badge: "Instant Approval",
      description:
        "Get early access to up to 50% of your earned salary before payday to take care of urgent household obligations.",
    },
    {
      title: "Education Loan",
      icon: GraduationCap,
      description:
        "Flexible tuition payment loans designed to ensure continuous schooling and academic success for your wards.",
    },
    {
      title: "Corporate Business Loan",
      icon: Building2,
      description:
        "Structured financing, asset acquisition capital, and project funding for larger corporate growth initiatives.",
    },
    {
      title: "Home Improvement",
      icon: Home,
      description:
        "Acquire funds to upgrade, renovate, or expand your housing and land properties with flexible terms.",
    },
  ];

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

  return (
    <section
      className="relative py-20 overflow-hidden"
      id="loans"
      style={{ backgroundColor: "#05080a" }}
    >
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

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
              // 02 . Micro financing schemes
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Unlock Opportunities with{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                Empowering Loans
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
        <div className="relative">
          <div
            ref={carouselRef}
            className="flex overflow-x-auto gap-6 snap-x snap-mandatory scrollbar-none pb-6 px-1 scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {loanData.map((loan, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="glass-card relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-[#0a0f12]/60 p-6 sm:p-8 transition-colors hover:border-emerald-500/20 snap-start shrink-0 w-[290px] sm:w-[350px] min-h-[250px]"
              >
                {loan.badge && (
                  <span className="absolute top-4 right-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    {loan.badge}
                  </span>
                )}
                <div>
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 text-emerald-400 border border-emerald-500/20">
                    <loan.icon size={22} />
                  </div>
                  <h3
                    className="text-xl font-bold text-white mb-2"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {loan.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-400 mb-6">
                    {loan.description}
                  </p>
                </div>
                <div className="flex items-center text-xs font-semibold text-emerald-400 group cursor-pointer hover:text-emerald-300 mt-auto">
                  Apply for Loan
                  <ArrowRight
                    size={14}
                    className="ml-1.5 transition-transform group-hover:translate-x-1"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Loans;
