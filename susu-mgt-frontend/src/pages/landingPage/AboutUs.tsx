import { useEffect, useState, useRef } from "react";
import "./landingPage.css";
import sideImage from "../../assets/sideimage.jpg";

const AboutUs = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.2 } // Triggers when 20% of section is visible
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="portfolio-section bg-[#0a0a0a] py-20 overflow-hidden" 
      id="portfolio"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:flex lg:items-center lg:gap-16">
        
        {/* Image Section - Slides from Left */}
        <div 
          className={`lg:w-1/2 transition-all duration-[1200ms] ease-out ${
            isVisible ? "translate-x-0 opacity-100 blur-0" : "-translate-x-20 opacity-0 blur-sm"
          }`}
        >
          <div className="relative group">
            {/* Green accent frame behind the image */}
            <div className="absolute -bottom-4 -left-4 h-full w-full border-2 border-green-500/30 rounded-2xl transition-transform duration-500 group-hover:-translate-x-2 group-hover:translate-y-2"></div>
            <img 
              src={sideImage} 
              alt="Financial Support" 
              className="relative z-10 rounded-2xl shadow-2xl grayscale-[30%] hover:grayscale-0 transition-all duration-700"
            />
          </div>
        </div>

        {/* Content Section - Slides from Right */}
        <div 
          className={`mt-12 lg:mt-0 lg:w-1/2 transition-all duration-[1200ms] delay-200 ease-out ${
            isVisible ? "translate-x-0 opacity-100" : "translate-x-20 opacity-0"
          }`}
        >
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            About <span className="text-green-400">Us</span>
          </h2>

          <div className="mt-6 space-y-4 text-gray-400 leading-relaxed">
            <p>
              At <span className="text-green-400 font-semibold">Express Capital</span>, we believe financial support
              should be simple, reliable, and accessible to everyone. We are
              committed to helping individuals, families, and businesses achieve
              their financial goals.
            </p>

            <p>
              Built on integrity, transparency, and customer satisfaction, we
              provide secure and convenient financial services designed to promote
              growth and long-term stability.
            </p>
          </div>

          {/* Stats - Staggered Fade Up */}
          <div className="mt-10 flex flex-wrap gap-8">
            <div className={`transition-all duration-700 delay-500 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
              <div className="text-3xl font-bold text-white">500+</div>
              <div className="text-sm text-green-400 font-medium">Customers</div>
            </div>

            <div className={`transition-all duration-700 delay-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
              <div className="text-3xl font-bold text-white">20+</div>
              <div className="text-sm text-green-400 font-medium">Years Service</div>
            </div>

            <div className={`transition-all duration-700 delay-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
              <div className="text-3xl font-bold text-white">7+</div>
              <div className="text-sm text-green-400 font-medium">Awards</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default AboutUs;