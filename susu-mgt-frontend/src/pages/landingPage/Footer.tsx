import React, { useEffect, useState, useRef } from "react";
import "./landingPage.css";

const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

  const socialLinks = [
    { label: "Instagram", href: "https://instagram.com", icon: "M7.8 2H16.2C19.4 2 22 4.6 22 7.8V16.2C22 19.4 19.4 22 16.2 22H7.8C4.6 22 2 19.4 2 16.2V7.8C2 4.6 4.6 2 7.8 2M7.6 4C5.61 4 4 5.61 4 7.6V16.4C4 18.39 5.61 20 7.6 20H16.4C18.39 20 20 18.39 20 16.4V7.6C20 5.61 18.39 4 16.4 4H7.6M17.25 5.5C17.94 5.5 18.5 6.06 18.5 6.75S17.94 8 17.25 8S16 7.44 16 6.75S16.56 5.5 17.25 5.5M12 7C14.76 7 17 9.24 17 12S14.76 17 12 17S7 14.76 7 12S9.24 7 12 7M12 9C10.34 9 9 10.34 9 12S10.34 15 12 15S15 13.66 15 12S13.66 9 12 9Z" },
    { label: "Facebook", href: "https://facebook.com", icon: "M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C18.34 21.21 22 17.06 22 12.06C22 6.53 17.5 2.04 12 2.04Z" },
    { label: "Twitter", href: "https://x.com", icon: "M22.46 6C21.69 6.35 20.86 6.58 20 6.69C20.88 6.16 21.56 5.32 21.88 4.31C21.05 4.81 20.13 5.16 19.16 5.36C18.37 4.5 17.26 4 16 4C13.65 4 11.73 5.92 11.73 8.29C11.73 8.63 11.77 8.96 11.84 9.27C8.28 9.09 5.11 7.38 3 4.79C2.63 5.42 2.42 6.16 2.42 6.94C2.42 8.43 3.17 9.75 4.33 10.5C3.62 10.5 2.96 10.3 2.38 10V10.03C2.38 12.11 3.86 13.85 5.82 14.24C5.46 14.34 5.08 14.39 4.69 14.39C4.42 14.39 4.15 14.36 3.89 14.31C4.43 16 6 17.26 7.89 17.29C6.43 18.45 4.58 19.13 2.56 19.13C2.22 19.13 1.88 19.11 1.54 19.07C3.44 20.29 5.74 21 8.23 21C16 21 20.33 14.46 20.33 8.79C20.33 8.6 20.33 8.42 20.32 8.23C21.16 7.63 21.88 6.87 22.46 6Z" },
    { label: "LinkedIn", href: "https://linkedin.com", icon: "M19 3C19.55 3 20.05 3.21 20.41 3.59C20.79 3.95 21 4.45 21 5V19C21 19.55 20.79 20.05 20.41 20.41C20.05 20.79 19.55 21 19 21H5C4.45 21 3.95 20.79 3.59 20.41C3.21 20.05 3 19.55 3 19V5C3 4.45 3.21 3.95 3.59 3.59C3.95 3.21 4.45 3 5 3H19M18.5 18.5V13.2C18.5 11.87 17.45 10.82 16.12 10.82C15.21 10.82 14.46 11.37 14.17 12.15V11H11.5V18.5H14.17V13.57C14.17 12.82 14.79 12.2 15.54 12.2C16.29 12.2 16.91 12.82 16.91 13.57V18.5H18.5M6.88 9.57C7.63 9.57 8.25 8.96 8.25 8.21C8.25 7.46 7.63 6.84 6.88 6.84C6.13 6.84 5.5 7.46 5.5 8.21C5.5 8.96 6.13 9.57 6.88 9.57M8.21 18.5V11H5.5V18.5H8.21Z" },
  ];

  return (
    <footer 
      ref={footerRef} 
      className="bg-[#0a0a0a] py-16 border-t border-white/5"
    >
      <div className="mx-auto max-w-7xl px-6 flex flex-col items-center overflow-hidden">
        
        {/* Social Links - Hovering Drift Animation */}
        <div className="flex gap-6 mb-10">
          {socialLinks.map((link, i) => (
            <a
              key={i}
              href={link.href}
              target="_blank"
              rel="noopener"
              aria-label={link.label}
              className={`group relative flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition-all duration-700 ease-out hover:border-green-400 hover:text-green-400 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
              }`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d={link.icon} />
              </svg>
              {/* Particle effect on hover */}
              <span className="absolute inset-0 rounded-full bg-green-400/0 transition-all group-hover:scale-150 group-hover:bg-green-400/10" />
            </a>
          ))}
        </div>

        {/* Footer Text - Horizontal Reveal Animation */}
        <div 
          className={`text-center transition-all duration-[1500ms] delay-500 ease-out ${
            isVisible ? "opacity-100 blur-0" : "opacity-0 blur-md"
          }`}
        >
          <p className="text-gray-500 text-sm md:text-base leading-relaxed">
            © 2026 <span className="text-green-400 font-bold tracking-tight">EXPRESS</span>{" "}
            <span className="text-white font-medium">CAPITAL</span>
            <span className="block mt-2 text-gray-600 sm:inline sm:mt-0 sm:ml-2">
              Simple, reliable, and flexible financial support you can trust.
            </span>
          </p>
          
          <div className={`mt-4 h-[1px] w-0 bg-gradient-to-r from-transparent via-green-500/30 to-transparent transition-all duration-[2000ms] delay-700 mx-auto ${
            isVisible ? "w-full" : "w-0"
          }`} />

          <p className="mt-4 text-xs text-gray-700">
            Design by{" "}
            <a 
              href="#" 
              className="text-gray-400 hover:text-green-400 transition-colors underline underline-offset-4 decoration-white/10"
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