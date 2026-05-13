import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import bgImage from "../../assets/bgimg.png";

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { 
        threshold: 0.60, 
        rootMargin: "-20px" 
      }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Shared ultra-smooth transition class
  const smoothTransition = "transition-all duration-[1500ms] cubic-bezier(0.33, 1, 0.68, 1)";

  return (
    <section 
      ref={sectionRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat"
      id="home"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/60 shadow-2xl"></div>

      <div className="relative z-10 flex flex-col items-center px-4 text-center">
        
        {/* H1 - Smooth Slide Up & Fade */}
        <h1 
          className={`text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl transition-all duration-[1200ms] ease-out ${
            isVisible 
              ? "translate-y-0 opacity-100 blur-0" 
              : "translate-y-12 opacity-0 blur-sm"
          }`}
        >
          EXPRESS <span className="text-green-400">CAPITAL</span>
        </h1>

        {/* Subtitle - Slightly longer delay for "floaty" feel */}
        <p 
          className={`mt-6 max-w-lg text-lg text-gray-200 transition-all duration-[1200ms] delay-[300ms] ease-out sm:text-xl ${
            isVisible 
              ? "translate-y-0 opacity-100" 
              : "translate-y-8 opacity-0"
          }`}
        >
          Trusted Financial Services for Everyone.
        </p>

        {/* Button - Pops up from the bottom with a scale effect */}
        <div 
          className={`mt-10 flex w-full justify-center transition-all duration-[1000ms] delay-[600ms] ease-out ${
            isVisible 
              ? "translate-y-0 opacity-100 scale-100" 
              : "translate-y-16 opacity-0 scale-90"
          }`}
        >
          <Link 
            to="/register" 
            className="group flex w-full max-w-[280px] items-center justify-center gap-2 rounded-full bg-green-500 py-4 text-sm font-bold text-black shadow-lg transition-all duration-300 hover:scale-105 hover:bg-green-400 hover:shadow-green-500/20 active:scale-95 sm:text-base"
          >
            Start Saving Now
            <ChevronRight className="transition-transform duration-300 group-hover:translate-x-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;


