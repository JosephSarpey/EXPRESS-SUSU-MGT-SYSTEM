import React, { useEffect, useRef, useState } from "react";
import "./landingPage.css";

// 1. Improved Intersection Observer Hook
const useIntersection = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = elementRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        // On large screens, we unobserve immediately once triggered 
        // to lock the "visible" state and prevent flickering
        observer.unobserve(entry.target);
      }
    }, {
      threshold: 0.05, // Trigger when only 5% is visible (better for large screens)
      ...options
    });

    observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [options]);

  return [elementRef, isIntersecting] as const;
};

const LoanCard = ({ loan, index }: { loan: any; index: number }) => {
  // Pass a small threshold here for individual cards
  const [ref, visible] = useIntersection({ threshold: 0.05 });

  return (
    <div
      ref={ref}
      className={`service-card ${visible ? "reveal-visible" : "reveal-hidden"}`}
      style={{ 
        // Ensure delay only applies when becoming visible
        transitionDelay: visible ? `${index * 100}ms` : '0ms' 
      }}
    >
      <div className="service-icon">
        {loan.iconType === 'svg' ? (
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
            <path d={loan.iconPath} />
          </svg>
        ) : (
          <i className={loan.iconClass}></i>
        )}
      </div>
      <h3 className="service-title">{loan.title}</h3>
      <p className="service-description">{loan.description}</p>
      <div className="service-price">{loan.price}</div>
    </div>
  );
};

const Loans = () => {
  // Use threshold 0 for header so it triggers the moment it enters the screen
  const [headerRef, headerVisible] = useIntersection({ threshold: 0 });

  const loanData = [
    { title: "Personal Loan", price: "Starting at $350", iconType: 'svg', iconPath: "M12 2C10.34 2 9 3.34 9 5C9 6.66 10.34 8 12 8C13.66 8 15 6.66 15 5C15 3.34 13.66 2 12 2ZM12 9C8.69 9 6 11.69 6 15C6 16.66 6.56 18.17 7.5 19.32V22L12 20L16.5 22V19.32C17.44 18.17 18 16.66 18 15C18 11.69 15.31 9 12 9Z", description: "Get quick and flexible financial support for your personal needs." },
    { title: "SME Loan", price: "Starting at $2,800", iconType: 'svg', iconPath: "M12 6.5C12 5.67 11.33 5 10.5 5S9 5.67 9 6.5 9.67 8 10.5 8 12 7.33 12 6.5M13.5 5C12.67 5 12 5.67 12 6.5S12.67 8 13.5 8 15 7.33 15 6.5 14.33 5 13.5 5M12 21.35L5.35 14.7C3.58 12.93 2.61 10.54 2.61 8.04C2.61 3.74 6.05 0.25 10.36 0.21C14.72 0.17 18.29 3.69 18.29 8C18.29 10.53 17.34 12.88 15.58 14.65L12 21.35Z", description: "Support your business growth with flexible financing." },
    { title: "Salary Advance", price: "Custom Pricing", iconType: 'svg', iconPath: "M19 3H14.82C14.4 1.84 13.3 1 12 1S9.6 1.84 9.18 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM12 3C12.55 3 13 3.45 13 4S12.55 5 12 5 11 4.55 11 4 11.45 3 12 3ZM12 18L8 14H11V9H13V14H16L12 18Z", description: "Access a portion of your salary before payday." },
    { title: "Education Loan", price: "Starting at $300", iconType: 'font', iconClass: "fa-solid fa-book-open", description: "Invest in your future with financial support for tuition." },
    { title: "Business Loan", price: "Per request", iconType: 'font', iconClass: "fa-solid fa-business-time", description: "Grow your business with reliable financing." },
    { title: "Home Improvement", price: "Starting at $200", iconType: 'font', iconClass: "fa-solid fa-house", description: "Upgrade and renovate your home with affordable financing." }
  ];

  return (
    <section className="about-section" id="about">
      <div className="services-container">
        <div 
          ref={headerRef} 
          className={`section-header ${headerVisible ? "reveal-visible" : "reveal-hidden"}`}
        >
          <h2 className="section-title">Our Loans</h2>
          <p className="section-subtitle">
            We provide flexible and affordable loan solutions.
          </p>
        </div>

        <div className="services-grid">
          {loanData.map((loan, index) => (
            <LoanCard key={index} loan={loan} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Loans;