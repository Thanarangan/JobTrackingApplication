import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import BentoSection from "@/components/landing/BentoSection";
import StepperSection from "@/components/landing/StepperSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTABanner from "@/components/landing/CTABanner";
import LandingFooter from "@/components/landing/LandingFooter";
const Index = () => {
    return (<div className="min-h-screen bg-background">
      <LandingNavbar />
      <HeroSection />
      <BentoSection />
      <div id="vault"/>
      <StepperSection />
      <TestimonialsSection />
      <CTABanner />
      <LandingFooter />
    </div>);
};
export default Index;
