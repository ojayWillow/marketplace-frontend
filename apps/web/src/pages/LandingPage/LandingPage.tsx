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
    <div className="relative bg-gray-50 dark:bg-[#0a0a0f] min-h-screen">
      {/* Full-page gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Light theme: soft blue-to-green wash */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/80 via-white to-green-50/60 dark:hidden" />
        {/* Dark theme: deep blue-to-green glow */}
        <div className="absolute inset-0 hidden dark:block bg-gradient-to-br from-blue-600/20 via-transparent to-green-600/10" />
      </div>

      {/* Page content — alternating dark section backgrounds for visual hierarchy */}
      <div className="relative">
        {/* Hero Section — base dark bg */}
        <section className="relative overflow-hidden">
          <div className="relative max-w-6xl mx-auto px-4 py-8 sm:py-12 md:py-16 lg:py-24">
            <div className="lg:grid lg:grid-cols-2 gap-12 items-center">
              <HeroSection />
              <PhoneLoginCard />
            </div>
          </div>
        </section>

        {/* HowItWorks — elevated dark surface */}
        <div className="dark:bg-gray-900/50">
          <HowItWorksSection />
        </div>

        {/* Categories — base dark bg (transparent, inherits page bg) */}
        <CategoriesSection />

        {/* Trust — elevated dark surface */}
        <div className="dark:bg-gray-900/50">
          <TrustSection />
        </div>

        {/* CTA — base dark bg */}
        <CTASection />
      </div>
    </div>
  );
}
