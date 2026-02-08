import { OfferingInfoBarProps } from '../types';

const OfferingInfoBar = ({ safePriceType, serviceRadius, postedDate }: OfferingInfoBarProps) => (
  <div className="mx-4 mb-3 md:mx-6 md:mb-5 bg-gray-50 rounded-lg border border-gray-100">
    <div className="grid grid-cols-3 divide-x divide-gray-200">
      <div className="py-2.5 md:py-3.5 text-center">
        <div className="text-xs text-gray-400 font-medium mb-0.5">Type</div>
        <div className="text-sm md:text-base font-bold text-gray-800 capitalize">{safePriceType}</div>
      </div>
      <div className="py-2.5 md:py-3.5 text-center">
        <div className="text-xs text-gray-400 font-medium mb-0.5">Range</div>
        <div className="text-sm md:text-base font-bold text-gray-800">{serviceRadius || 10}km</div>
      </div>
      <div className="py-2.5 md:py-3.5 text-center">
        <div className="text-xs text-gray-400 font-medium mb-0.5">Posted</div>
        <div className="text-sm md:text-base font-bold text-gray-800">{postedDate || 'N/A'}</div>
      </div>
    </div>
  </div>
);

export default OfferingInfoBar;
