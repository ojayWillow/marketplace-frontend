import {
  HeroSection,
  PhoneLoginCard,
  HowItWorksSection,
  CategoriesSection,
  TrustSection,
  CTASection,
} from './components';

export default function LandingPage() {
  return (
    <div className="bg-[#0a0a0f] min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-green-600/10" />
        <div className="relative max-w-6xl mx-auto px-4 py-8 sm:py-12 md:py-16 lg:py-24">
          <div className="lg:grid lg:grid-cols-2 gap-12 items-center">
            <HeroSection />
            <PhoneLoginCard />
          </div>
        </div>
      </section>

      <HowItWorksSection />
      <CategoriesSection />
      <TrustSection />
      <CTASection />
    </div>
  );
}
