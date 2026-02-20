import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOffering } from '../../api/hooks';
import { useAuthStore } from '@marketplace/shared';
import ShareButton from '../../components/ui/ShareButton';
import SEOHead from '../../components/ui/SEOHead';
import ImageGallery from '../../components/ImageGallery';
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
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { data: offering, isLoading: loading, error: queryError } = useOffering(Number(id));
  const { contacting, handleContact, handleBoost, isBoosting } = useOfferingActions(offering);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mx-auto mb-3"></div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t('offeringDetail.loading', 'Loading offering...')}</p>
        </div>
      </div>
    );
  }

  // Not found
  if (queryError || !offering) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-5xl mb-3">😕</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('offeringDetail.notFound', 'Offering Not Found')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">{t('offeringDetail.notFoundDescription', 'This offering may have been removed or is no longer available.')}</p>
          <Link to="/tasks" className="bg-amber-500 text-white px-5 py-2.5 rounded-lg hover:bg-amber-600 transition-colors text-sm font-semibold">
            {t('offeringDetail.browseAll', 'Browse All Offerings')}
          </Link>
        </div>
      </div>
    );
  }

  const safe = getSafeValues(offering, t);
  const isOwner = user?.id === offering.creator_id;
  const boostTimeRemaining = getBoostTimeRemaining(offering.boost_expires_at);
  const shortLocation = offering.location?.split(',').slice(0, 2).join(', ') || '';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-36 md:pb-8">
      <SEOHead
        title={safe.safeTitle}
        description={safe.seoDescription}
        url={`/offerings/${offering.id}`}
        type="product"
        price={offering.price}
      />

      {/* Top bar */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 z-50 md:static md:border-b-0">
        <div className="flex items-center justify-between px-4 py-2.5 md:max-w-2xl md:mx-auto md:py-4">
          <Link to="/tasks" className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 text-sm font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden md:inline">← {t('offeringDetail.backToQuickHelp', 'Back to Quick Help')}</span>
            <span className="md:hidden">{t('offeringDetail.back', 'Back')}</span>
          </Link>
          <ShareButton
            url={`/offerings/${offering.id}`}
            title={safe.safeTitle}
            description={`${safe.categoryLabel} service - ${safe.priceDisplay}`}
            categoryIcon={safe.categoryIcon}
            categoryEmoji={safe.categoryIcon}
            price={safe.priceDisplay}
            location={shortLocation}
            postedDate={safe.postedDate}
            size="sm"
          />
        </div>
      </div>

      <div className="px-4 pt-3 md:max-w-2xl md:mx-auto md:pt-0">
        {/* Main card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-950/50 border border-gray-100 dark:border-gray-800 overflow-hidden">
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
          />

          {/* Thin divider — mobile only */}
          <div className="border-t border-gray-100 dark:border-gray-800 mx-4 md:hidden" />

          {/* Description */}
          {safe.safeDescription && (
            <div className="px-4 py-3 md:px-6 md:py-5">
              <h2 className="hidden md:block text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('offeringDetail.aboutThisService', 'About this service')}</h2>
              <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {safe.safeDescription}
              </p>
            </div>
          )}

          {/* Images */}
          {(offering as any).images && (offering as any).images.length > 0 && (
            <div className="px-4 pb-3 md:px-6 md:pb-5">
              <ImageGallery images={(offering as any).images} alt={safe.safeTitle} />
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
                {contacting ? t('offeringDetail.starting', 'Starting...') : `💬 ${t('offeringDetail.contactName', { name: safe.safeCreatorName.split(' ')[0], defaultValue: 'Contact {{name}}' })}`}
              </button>
            </div>
          )}
        </div>

        {/* Matching Jobs */}
        <MatchingJobsSection offering={offering} userId={user?.id} />

        {/* How it works */}
        <HowItWorksSection />
      </div>

      {/* Fixed bottom action bar — MOBILE ONLY */}
      {!isOwner && (
        <div 
          className="fixed left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-40 shadow-lg dark:shadow-gray-950/50 md:hidden"
          style={{ bottom: 'var(--nav-total-height, 64px)' }}
        >
          <div className="max-w-3xl mx-auto px-4 py-3">
            <button
              onClick={handleContact}
              disabled={contacting}
              className="w-full bg-amber-500 text-white py-3 rounded-xl hover:bg-amber-600 transition-colors disabled:bg-gray-400 font-bold text-sm shadow-md active:scale-[0.98]"
            >
              {contacting ? t('offeringDetail.starting', 'Starting...') : `💬 ${t('offeringDetail.contactName', { name: safe.safeCreatorName.split(' ')[0], defaultValue: 'Contact {{name}}' })}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferingDetail;
