import React from 'react'
import Header from './Header'
import HeroSection from './HeroSection'
import AboutUs from './AboutUs'
import Savings from './Savings'
import Loans from './Loans'
import Contact from './Contact'
import Footer from './Footer'
import "./landingPage.css"
const HomePage = () => {
  return (
    <div className="landing-page-wrapper">
        <Header />
        <HeroSection />
        <AboutUs />
        <Savings />
        <Loans />
        <Contact />
        <Footer />
    </div>
  )
}
export default HomePage