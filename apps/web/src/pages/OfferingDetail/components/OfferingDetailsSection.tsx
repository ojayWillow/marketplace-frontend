import { useState } from 'react';
import { OfferingDetailsSectionProps } from '../types';

const OfferingDetailsSection = ({ experience, availability }: OfferingDetailsSectionProps) => {
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (!experience && !availability) return null;

  return (
    <div className="mx-4 mb-3 md:mx-6 md:mb-5">
      <button
        onClick={() => setDetailsOpen(!detailsOpen)}
        className="w-full flex items-center justify-between py-2 text-left"
      >
        <span className="font-semibold text-sm md:text-base text-gray-700 flex items-center gap-1.5">
          📋 Details & Experience
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform md:hidden ${detailsOpen ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`pb-2 space-y-3 ${detailsOpen ? 'block' : 'hidden md:block'}`}>
        {experience && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Experience & Qualifications</h3>
            <p className="text-sm md:text-base text-gray-700 whitespace-pre-wrap">{experience}</p>
          </div>
        )}
        {availability && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Availability</h3>
            <div className="flex items-center gap-1.5 text-sm md:text-base text-gray-700">
              <span>📅</span>
              <span>{availability}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferingDetailsSection;
