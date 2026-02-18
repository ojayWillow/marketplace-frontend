import { OfferingInfoBarProps } from '../types';

const OfferingInfoBar = ({ safePriceType, serviceRadius, postedDate }: OfferingInfoBarProps) => (
  <div className="mx-4 mb-3 md:mx-6 md:mb-5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
    <div className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-700">
      <div className="py-2.5 md:py-3.5 text-center">
        <div className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-0.5">Type</div>
        <div className="text-sm md:text-base font-bold text-gray-800 dark:text-gray-200 capitalize">{safePriceType}</div>
      </div>
      <div className="py-2.5 md:py-3.5 text-center">
        <div className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-0.5">Range</div>
        <div className="text-sm md:text-base font-bold text-gray-800 dark:text-gray-200">{serviceRadius || 10}km</div>
      </div>
      <div className="py-2.5 md:py-3.5 text-center">
        <div className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-0.5">Posted</div>
        <div className="text-sm md:text-base font-bold text-gray-800 dark:text-gray-200">{postedDate || 'N/A'}</div>
      </div>
    </div>
  </div>
);

export default OfferingInfoBar;
