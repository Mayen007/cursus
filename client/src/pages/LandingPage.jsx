import ApplicationsSection from "../components/landing/ApplicationsSection.jsx";
import CallToActionSection from "../components/landing/CallToActionSection.jsx";
import HowItWorksSection from "../components/landing/HowItWorksSection.jsx";
import LandingFooter from "../components/landing/LandingFooter.jsx";
import LandingHeader from "../components/landing/LandingHeader.jsx";
import LandingHero from "../components/landing/LandingHero.jsx";
import PrivacySection from "../components/landing/PrivacySection.jsx";
import ScoreSection from "../components/landing/ScoreSection.jsx";

export default function LandingPage() {
  const isAuthenticated = Boolean(sessionStorage.getItem("sessionToken"));

  return (
    <main className="min-h-screen bg-paper text-ink">
      <LandingHeader isAuthenticated={isAuthenticated} />
      <LandingHero isAuthenticated={isAuthenticated} />
      <HowItWorksSection />
      <ScoreSection />
      <ApplicationsSection />
      <PrivacySection />
      <CallToActionSection isAuthenticated={isAuthenticated} />
      <LandingFooter isAuthenticated={isAuthenticated} />
    </main>
  );
}
