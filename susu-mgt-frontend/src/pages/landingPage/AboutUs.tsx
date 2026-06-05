import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Users, Calendar, Award } from "lucide-react";
import sideImage from "../../assets/sideimage.jpg";

// Custom dynamic count-up component for financial dashboard numbers
const Counter = ({ value }: { value: string }) => {
  const numericVal = parseInt(value);
  const hasPlus = value.includes("+");
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (inView) {
      let start = 0;
      const end = numericVal;
      if (start === end) return;

      const duration = 1800; // Total counter animation duration (1.8s)
      let startTime: number | null = null;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        
        // Easing out function for smooth landing
        const easeOutQuad = (t: number) => t * (2 - t);
        const currentCount = Math.floor(easeOutQuad(progress) * (end - start) + start);

        setCount(currentCount);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [inView, numericVal]);

  return <span ref={ref}>{count.toLocaleString()}{hasPlus && "+"}</span>;
};

const AboutUs = () => {
  const stats = [
    {
      value: "500+",
      label: "Active Customers",
      icon: Users,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      value: "20+",
      label: "Years of Service",
      icon: Calendar,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      value: "7+",
      label: "National Awards",
      icon: Award,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  return (
    <section
      className="relative py-24 overflow-hidden"
      id="about-us"
      style={{ backgroundColor: "#05080a" }}
    >
      {/* Background fintech micro-grid */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" 
        style={{ 
          backgroundImage: "linear-gradient(rgba(16, 185, 129, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.15) 1px, transparent 1px)", 
          backgroundSize: "45px 45px" 
        }} 
      />

      {/* Ambient Decorative Blur Blob */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          
          {/* LEFT: Stunning Image with Glass Outline Frame and Floating Animation */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-6"
          >
            <div className="relative group mx-auto max-w-md lg:max-w-none">
              {/* Outer pulsing glow */}
              <div className="absolute -inset-4 rounded-2xl bg-gradient-to-tr from-emerald-500/10 to-teal-500/5 blur-xl opacity-80 animate-pulse-glow" />
              
              {/* Slow Floating border frame */}
              <motion.div 
                className="absolute -bottom-4 -left-4 h-full w-full border border-emerald-500/30 rounded-2xl pointer-events-none"
                animate={{ x: [-3, 3, -3], y: [3, -3, 3] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              />
              
              {/* Actual Image */}
              <img
                src={sideImage}
                alt="Unique Capital Team"
                className="relative z-10 w-full rounded-2xl object-cover shadow-2xl transition-transform duration-700 group-hover:scale-[1.01]"
                style={{ maxHeight: "480px" }}
              />
            </div>
          </motion.div>

          {/* RIGHT: Detailed Content with Animated Stats */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="lg:col-span-6 flex flex-col justify-center"
          >
            <motion.span
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-[11px] font-mono tracking-[0.25em] text-emerald-400 uppercase block mb-3 font-semibold"
            >
              // 03 . Unique Capital profile
            </motion.span>

            <h2
              className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Empowering Ghana’s Financial{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-300 bg-clip-text text-transparent">
                Future
              </span>
            </h2>

            <div className="mt-6 space-y-4 text-base text-slate-400 leading-relaxed">
              <p>
                At{" "}
                <span className="text-white font-semibold">Unique Capital</span>
                , we believe financial inclusion is a fundamental right. We
                design modern Susu savings schemes and flexible lending
                solutions customized for daily earners, market traders, salary
                workers, and growing businesses.
              </p>
              <p>
                Founded on pillars of absolute security, prompt customer
                support, and complete operational transparency, our mission is
                to make wealth building simple, intuitive, and highly rewarding
                for every citizen across the nation.
              </p>
            </div>

            {/* Stats Cards Grid with count-up animations */}
            <div className="mt-10 grid gap-4 grid-cols-3">
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -3 }}
                  className="glass-card rounded-xl border border-white/5 bg-[#0a0f12]/50 p-4 text-center"
                >
                  <div
                    className={`mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-lg border ${stat.bg} ${stat.color}`}
                  >
                    <stat.icon size={18} />
                  </div>
                  <div
                    className="text-xl sm:text-2xl font-bold text-white"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    <Counter value={stat.value} />
                  </div>
                  <div className="mt-1 text-[10px] sm:text-xs text-slate-400 font-medium leading-tight">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default AboutUs;
