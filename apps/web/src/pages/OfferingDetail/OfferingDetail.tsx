import { useParams, Link } from 'react-router-dom';
import { useOffering } from '../../api/hooks';
import { useAuthStore } from '@marketplace/shared';
import ShareButton from '../../components/ui/ShareButton';
import SEOHead from '../../components/ui/SEOHead';
import {
  OfferingHeader,
  OfferingProfileRow,
  OfferingInfoBar,
  OfferingDetailsSection,
  OfferingBoostSection,
  OfferingLocationMap,
  MatchingJobsSection,
  HowItWorksSection,
} from './components';
import { useOfferingActions } from './hooks';
import { getSafeValues, getBoostTimeRemaining } from './utils';

const OfferingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { data: offering, isLoading: loading, error: queryError } = useOffering(Number(id));
  const { contacting, handleContact, handleBoost, isBoosting } = useOfferingActions(offering);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Loading offering...</p>
        </div>
      </div>
    );
  }

  // Not found
  if (queryError || !offering) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-5xl mb-3">\ud83d\ude15</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Offering Not Found</h2>
          <p className="text-gray-600 mb-4 text-sm">This offering may have been removed or is no longer available.</p>
          <Link to="/tasks" className="bg-amber-500 text-white px-5 py-2.5 rounded-lg hover:bg-amber-600 transition-colors text-sm font-semibold">
            Browse All Offerings
          </Link>
        </div>
      </div>
    );
  }

  const safe = getSafeValues(offering);
  const isOwner = user?.id === offering.creator_id;
  const boostTimeRemaining = getBoostTimeRemaining(offering.boost_expires_at);

  return (
    <div className="min-h-screen bg-gray-50 pb-36 md:pb-8">
      <SEOHead
        title={safe.safeTitle}
        description={safe.seoDescription}
        url={`/offerings/${offering.id}`}
        type="product"
        price={offering.price}
      />

      {/* Top bar */}
      <div className="sticky top-0 bg-white border-b border-gray-100 z-50 md:static md:border-b-0">
        <div className="flex items-center justify-between px-4 py-2.5 md:max-w-2xl md:mx-auto md:py-4">
          <Link to="/tasks" className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-sm font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden md:inline">\u2190 Back to Quick Help</span>
            <span className="md:hidden">Back</span>
          </Link>
          <ShareButton
            url={`/offerings/${offering.id}`}
            title={safe.safeTitle}
            description={`${safe.categoryLabel} service - ${safe.priceDisplay}`}
            size="sm"
          />
        </div>
      </div>

      <div className="px-4 pt-3 md:max-w-2xl md:mx-auto md:pt-0">
        {/* Main card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <OfferingHeader
            categoryIcon={safe.categoryIcon}
            categoryLabel={safe.categoryLabel}
            priceDisplay={safe.priceDisplay}
            safePriceType={safe.safePriceType}
            safeTitle={safe.safeTitle}
          />

          <OfferingProfileRow
            offering={offering}
            safeCreatorName={safe.safeCreatorName}
            isOwner={isOwner}
            contacting={contacting}
            onContact={handleContact}
          />

          {/* Thin divider \u2014 mobile only */}
          <div className="border-t border-gray-100 mx-4 md:hidden" />

          {/* Description */}
          {safe.safeDescription && (
            <div className="px-4 py-3 md:px-6 md:py-5">
              <h2 className="hidden md:block text-lg font-semibold text-gray-900 mb-3">About this service</h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                {safe.safeDescription}
              </p>
            </div>
          )}

          <OfferingInfoBar
            safePriceType={safe.safePriceType}
            serviceRadius={offering.service_radius}
            postedDate={safe.postedDate}
          />

          <OfferingDetailsSection
            experience={offering.experience}
            availability={offering.availability}
          />

          {isOwner && (
            <OfferingBoostSection
              offering={offering}
              boostTimeRemaining={boostTimeRemaining}
              onBoost={handleBoost}
              isBoosting={isBoosting}
            />
          )}

          {offering.latitude && offering.longitude && (
            <OfferingLocationMap
              latitude={offering.latitude}
              longitude={offering.longitude}
              safeTitle={safe.safeTitle}
              safeLocation={safe.safeLocation}
              serviceRadius={offering.service_radius}
            />
          )}

          {/* Desktop inline contact button */}
          {!isOwner && (
            <div className="hidden md:block px-6 pb-6">
              <button
                onClick={handleContact}
                disabled={contacting}
                className="w-full bg-amber-500 text-white py-3.5 rounded-xl hover:bg-amber-600 transition-colors disabled:bg-gray-400 font-bold text-base shadow-md"
              >
                {contacting ? 'Starting...' : `\ud83d\udcac Contact ${safe.safeCreatorName.split(' ')[0]}`}
              </button>
            </div>
          )}
        </div>

        {/* Matching Jobs */}
        <MatchingJobsSection offering={offering} userId={user?.id} />

        {/* How it works */}
        <HowItWorksSection />
      </div>

      {/* Fixed bottom action bar \u2014 MOBILE ONLY */}
      {!isOwner && (
        <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 z-40 shadow-lg md:hidden">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <button
              onClick={handleContact}
              disabled={contacting}
              className="w-full bg-amber-500 text-white py-3 rounded-xl hover:bg-amber-600 transition-colors disabled:bg-gray-400 font-bold text-sm shadow-md active:scale-[0.98]"
            >
              {contacting ? 'Starting...' : `\ud83d\udcac Contact ${safe.safeCreatorName.split(' ')[0]}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferingDetail;
