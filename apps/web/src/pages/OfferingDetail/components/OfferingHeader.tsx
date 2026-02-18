import { OfferingHeaderProps } from '../types';

const OfferingHeader = ({ categoryIcon, categoryLabel, priceDisplay, safePriceType, safeTitle }: OfferingHeaderProps) => (
  <>
    {/* ===== DESKTOP HEADER: gradient banner ===== */}
    <div className="hidden md:block bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 p-6 text-white">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{categoryIcon}</span>
          <span className="px-2.5 py-1 bg-white/25 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wide">
            {categoryLabel}
          </span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black">{priceDisplay}</div>
          {safePriceType === 'negotiable' && (
            <span className="text-amber-100 text-xs font-medium">Negotiable</span>
          )}
          {safePriceType === 'fixed' && (
            <span className="text-amber-100 text-xs font-medium">Fixed price</span>
          )}
        </div>
      </div>
      <h1 className="text-xl font-bold leading-tight">{safeTitle}</h1>
    </div>

    {/* ===== MOBILE HEADER: compact inline ===== */}
    <div className="md:hidden p-4 pb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{categoryIcon}</span>
          <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold uppercase tracking-wide">
            {categoryLabel}
          </span>
        </div>
        <div className="text-right">
          <span className="text-xl font-black text-amber-600 dark:text-amber-500">{priceDisplay}</span>
          {safePriceType !== 'hourly' && safePriceType !== 'fixed' && (
            <div className="text-xs text-gray-400 dark:text-gray-500 capitalize">{safePriceType}</div>
          )}
        </div>
      </div>
      <h1 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-snug">{safeTitle}</h1>
    </div>
  </>
);

export default OfferingHeader;
