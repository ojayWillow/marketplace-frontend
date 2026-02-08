import { OfferingBoostSectionProps } from '../types';

const OfferingBoostSection = ({ offering, boostTimeRemaining, onBoost, isBoosting }: OfferingBoostSectionProps) => (
  <div className="mx-4 mb-3 md:mx-6 md:mb-5 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
    <div className="flex items-center justify-between gap-2">
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-xs text-amber-800 flex items-center gap-1 mb-0.5">
          \ud83d\ude80 Boost Visibility
        </h3>
        {offering.is_boost_active && boostTimeRemaining ? (
          <p className="text-xs text-green-700 font-medium">\u2705 Active \u2022 {boostTimeRemaining} left</p>
        ) : (
          <p className="text-xs text-amber-700">Show on map for 24h</p>
        )}
      </div>
      {offering.is_boost_active && boostTimeRemaining ? (
        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-lg font-bold text-xs">\ud83d\udd25 Boosted</span>
      ) : (
        <button
          onClick={onBoost}
          disabled={isBoosting}
          className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all font-bold text-xs shadow-sm disabled:opacity-50"
        >
          {isBoosting ? '...' : '\u26a1 Boost'}
        </button>
      )}
    </div>
  </div>
);

export default OfferingBoostSection;
