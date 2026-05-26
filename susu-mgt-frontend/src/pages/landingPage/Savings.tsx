import { useEffect, useRef, useState } from "react";
import "./landingPage.css";

// 1. Reusable Intersection Observer Hook
const useIntersection = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        observer.unobserve(entry.target);
      }
    }, options);

    const currentRef = elementRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
      observer.disconnect();
    };
  }, [options]);

  return [elementRef, isIntersecting] as const;
};

// 2. Individual Savings Card Component
const SavingCard = ({ saving, index }: { saving: any; index: number }) => {
  const [ref, visible] = useIntersection({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      className={`service-card ${visible ? "reveal-visible" : "reveal-hidden"}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="service-icon">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
          <path d={saving.iconPath} />
        </svg>
      </div>

      <h3 className="service-title">{saving.title}</h3>
      <p className="service-description">{saving.description}</p>
      <div className="service-price">{saving.price}</div>
    </div>
  );
};

// 3. Main Savings Component
const Savings = () => {
  const [headerRef, headerVisible] = useIntersection({ threshold: 0.1 });

  const savingsData = [
    {
      title: "Regular Savings",
      price: "Custom pricing",
      iconPath: "M12 2C10.34 2 9 3.34 9 5C9 6.66 10.34 8 12 8C13.66 8 15 6.66 15 5C15 3.34 13.66 2 12 2ZM12 9C8.69 9 6 11.69 6 15C6 16.66 6.56 18.17 7.5 19.32V22L12 20L16.5 22V19.32C17.44 18.17 18 16.66 18 15C18 11.69 15.31 9 12 9Z",
      description: "A simple and secure savings plan that helps individuals build financial discipline while earning steady returns."
    },
    {
      title: "Fixed Savings",
      price: "Custom pricing",
      iconPath: "M12 6.5C12 5.67 11.33 5 10.5 5S9 5.67 9 6.5 9.67 8 10.5 8 12 7.33 12 6.5M13.5 5C12.67 5 12 5.67 12 6.5S12.67 8 13.5 8 15 7.33 15 6.5 14.33 5 13.5 5M12 21.35L5.35 14.7C3.58 12.93 2.61 10.54 2.61 8.04C2.61 3.74 6.05 0.25 10.36 0.21C14.72 0.17 18.29 3.69 18.29 8C18.29 10.53 17.34 12.88 15.58 14.65L12 21.35Z",
      description: "Save a fixed amount for a specific period and enjoy higher interest returns with guaranteed security."
    },
    {
      title: "Children’s Savings",
      price: "Custom Pricing",
      iconPath: "M19 3H14.82C14.4 1.84 13.3 1 12 1S9.6 1.84 9.18 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM12 3C12.55 3 13 3.45 13 4S12.55 5 12 5 11 4.55 11 4 11.45 3 12 3ZM12 18L8 14H11V9H13V14H16L12 18Z",
      description: "A dedicated savings plan designed to secure your child’s future education and financial needs."
    },
    {
      title: "Business Savings",
      price: "Custom pricing",
      iconPath: "M20.5 11H19V7C19 5.9 18.1 5 17 5H13V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4C2.9 5 2 5.9 2 7V10.8H3.5C4.99 10.8 6.2 12.01 6.2 13.5S4.99 16.2 3.5 16.2H2V20C2 21.1 2.9 22 4 22H7.8V20.5C7.8 19.01 9.01 17.8 10.5 17.8S13.2 19.01 13.2 20.5V22H17C18.1 22 19 21.1 19 20V16H20.5C21.88 16 23 14.88 23 13.5S21.88 11 20.5 11Z",
      description: "Flexible savings accounts tailored for businesses to manage funds efficiently while earning interest."
    },
    {
      title: "Emergency Savings",
      price: "Custom pricing",
      iconPath: "M12 2L2 7V9C2 14.55 5.84 19.74 11 21C16.16 19.74 20 14.55 20 9V7L12 2ZM12 11.5L9 8.5L10.41 7.09L12 8.67L15.59 5.09L17 6.5L12 11.5Z",
      description: "Build a financial safety net for unexpected expenses with easy access to your funds when needed."
    },
    {
      title: "Investment Savings",
      price: "Custom Pricing",
      iconPath: "M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM11 17L6 12L7.41 10.59L11 14.17L16.59 8.59L18 10L11 17Z",
      description: "Grow your wealth with savings plans designed to provide long-term financial growth and stable returns."
    }
  ];

  return (
    <section className="services-section" id="services">
      <div className="services-container">
        <div 
          ref={headerRef} 
          className={`section-header ${headerVisible ? "reveal-visible" : "reveal-hidden"}`}
        >
          <h2 className="section-title">Our Savings</h2>
          <p className="section-subtitle">
            Secure and flexible savings solutions designed to help you grow and
            manage your finances with confidence.
          </p>
        </div>

        <div className="services-grid">
          {savingsData.map((saving, index) => (
            <SavingCard key={index} saving={saving} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Savings;