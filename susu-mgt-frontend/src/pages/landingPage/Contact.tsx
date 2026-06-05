import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const contactData = [
    {
      label: "Email Support",
      value: "akambeyisaac199@gmail.com",
      href: "mailto:akambeyisaac199@gmail.com",
      icon: Mail,
      color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    },
    {
      label: "Call or WhatsApp",
      value: "+233 54 598 4455",
      href: "tel:+233545984455",
      icon: Phone,
      color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    },
    {
      label: "Head Office",
      value: "Spintex Rd, Greater Accra",
      href: "#",
      icon: MapPin,
      color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSubmitSuccess(false), 5000);
    }, 1500);
  };

  return (
    <section
      className="relative py-24 overflow-hidden"
      id="contact"
      style={{ backgroundColor: "#05080a" }}
    >
      {/* Decorative Blob */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-[11px] font-mono tracking-[0.25em] text-emerald-400 uppercase block mb-3 font-semibold"
          >
            // 04 . Connect with support
          </motion.span>
          <h2
            className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            We'd Love to{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Hear from You
            </span>
          </h2>
          <p className="mt-4 text-base text-slate-400">
            Have questions about our Susu schemes, interest rates, or loan
            terms? Drop us a line below.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-12">
          {/* LEFT: Contact Cards info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 space-y-6"
          >
            {contactData.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                className="glass-card flex items-start gap-5 rounded-2xl border border-white/5 bg-[#0a0f12]/50 p-6 transition-all hover:border-emerald-500/20 hover:bg-[#0a0f12]/80 group"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${item.color}`}
                >
                  <item.icon size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {item.label}
                  </h4>
                  <p className="mt-1 text-base font-semibold text-white group-hover:text-emerald-400 transition-colors">
                    {item.value}
                  </p>
                </div>
              </a>
            ))}
          </motion.div>

          {/* RIGHT: Contact Request Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7"
          >
            <form
              onSubmit={handleSubmit}
              className="glass-card rounded-3xl border border-white/5 bg-[#0a0f12]/40 p-6 sm:p-10"
            >
              <div className="grid gap-6 sm:grid-cols-2 mb-6">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500/50 focus:bg-white/10 focus:outline-none transition-all"
                    placeholder="Kwame Mensah"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500/50 focus:bg-white/10 focus:outline-none transition-all"
                    placeholder="kwame@example.com"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500/50 focus:bg-white/10 focus:outline-none transition-all"
                  placeholder="Inquiry about Daily Susu Schemes"
                />
              </div>

              <div className="mb-8">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500/50 focus:bg-white/10 focus:outline-none transition-all resize-none"
                  placeholder="How can we assist you with your financial goals?"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full group flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-4 text-sm font-bold text-slate-950 shadow-[0_4px_16px_rgba(16,185,129,0.2)] transition-all hover:bg-emerald-400 hover:shadow-[0_4px_24px_rgba(16,185,129,0.35)] active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Sending message...</span>
                ) : submitSuccess ? (
                  <span className="text-slate-950">
                    Message Sent Successfully!
                  </span>
                ) : (
                  <>
                    Send Message
                    <Send
                      size={16}
                      className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5"
                    />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
