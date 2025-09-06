
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import FeaturedProjects from "@/components/FeaturedProjects";
import SkillsetSection from "@/components/SkillsetSection";
import FoundersSection from "@/components/FoundersSection";
import PartnersSection from "@/components/PartnersSection";
import CallToAction from "@/components/CallToAction";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    // Check if we should scroll to founders section after navigation
    if (location.state?.scrollToFounders) {
      // Small delay to ensure the component is fully rendered
      setTimeout(() => {
        const foundersSection = document.getElementById('founders');
        if (foundersSection) {
          foundersSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location.state]);

  return (
    <div className="min-h-screen bg-portfolio-black">
      <Header />
      <HeroSection />
      <SkillsetSection />
      <FeaturedProjects />
      <FoundersSection />
      <PartnersSection />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default Index;
