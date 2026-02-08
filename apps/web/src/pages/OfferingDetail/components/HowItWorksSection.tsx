import { useState } from 'react';

const HowItWorksSection = () => {
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  return (
    <div className="mt-3 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
      <button
        onClick={() => setHowItWorksOpen(!howItWorksOpen)}
        className="w-full flex items-center justify-between px-4 py-3 md:px-6 text-left"
      >
        <span className="font-semibold text-sm md:text-base text-gray-700 flex items-center gap-1.5">
          💡 How it works
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform md:hidden ${howItWorksOpen ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`px-4 pb-4 md:px-6 md:pb-5 ${howItWorksOpen ? 'block' : 'hidden md:block'}`}>
        <ul className="text-gray-600 space-y-1.5 text-sm md:text-base">
          <li>• Contact the service provider to discuss your needs</li>
          <li>• Agree on scope, timing, and price</li>
          <li>• Service provider comes to you or meets at agreed location</li>
          <li>• Pay after the service is completed to your satisfaction</li>
        </ul>
      </div>
    </div>
  );
};

export default HowItWorksSection;
