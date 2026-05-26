import { useEffect, useState, useRef } from "react";
import "./landingPage.css";

const Contact = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const contactData = [
    {
      label: "Email",
      value: "akambeyisaac199@gmail.com",
      href: "mailto:akambeyisaac199@gmail.com",
      icon: "M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z",
    },
    {
      label: "Phone",
      value: "+ (233) 54 598 4455",
      href: "tel:+233545984455",
      icon: "M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.69 14.9 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z",
    },
    {
      label: "Location",
      value: "Spintex Greater Accra",
      href: "#",
      icon: "M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5S14.5 7.62 14.5 9S13.38 11.5 12 11.5Z",
    },
  ];

  return (
    <section 
      ref={sectionRef} 
      className="contact-section bg-[#0a0a0a] py-24 text-white" 
      id="contact"
    >
      <div className="mx-auto max-w-6xl px-6">
        
        {/* Header Animation: Smooth Fade Up & Expand */}
        <div className={`text-center transition-all duration-[1000ms] ease-out ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}>
          <h2 className="text-4xl font-bold sm:text-5xl">
            Get In <span className="text-green-400">Touch</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-400">
            We’re here to help you with reliable financial solutions and
            customer support whenever you need us.
          </p>
        </div>

        {/* Contact Cards with Staggered Pop-In Animation */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {contactData.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className={`group flex flex-col items-center rounded-3xl border border-white/5 bg-white/5 p-10 text-center transition-all duration-[800ms] hover:border-green-400/50 hover:bg-green-400/5 ${
                isVisible 
                  ? "scale-100 opacity-100" 
                  : "scale-75 opacity-0"
              }`}
              style={{ transitionDelay: `${(index + 1) * 200}ms` }}
            >
              {/* Icon Circle with Pulsing Border on Hover */}
              <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10 text-green-400 transition-all duration-300 group-hover:scale-110 group-hover:bg-green-500 group-hover:text-black">
                <svg className="h-8 w-8 fill-current" viewBox="0 0 24 24">
                  <path d={item.icon} />
                </svg>
              </div>

              <div className="text-sm font-medium text-gray-500 uppercase tracking-widest">
                {item.label}
              </div>
              <div className="mt-2 text-lg font-semibold text-white transition-colors group-hover:text-green-400">
                {item.value}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Contact;