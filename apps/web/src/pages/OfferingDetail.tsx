import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Offering } from '@marketplace/shared';
import { getTasks, Task } from '@marketplace/shared';
import { useOffering, useBoostOffering } from '../api/hooks';
import { useAuthStore } from '@marketplace/shared';
import { useToastStore } from '@marketplace/shared';
import { getCategoryIcon, getCategoryLabel } from '../constants/categories';
import { apiClient } from '@marketplace/shared';
import ShareButton from '../components/ui/ShareButton';
import SEOHead from '../components/ui/SEOHead';

// StarRating helper component
const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating || 0);
  const hasHalfStar = (rating || 0) % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  return (
    <span className="text-yellow-500 text-sm">
      {'★'.repeat(fullStars)}
      {hasHalfStar && '½'}
      {'☆'.repeat(emptyStars)}
    </span>
  );
};

const OfferingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const toast = useToastStore();

  // React Query for offering data
  const { data: offering, isLoading: loading, error: queryError, refetch } = useOffering(Number(id));
  const boostMutation = useBoostOffering();

  const [contacting, setContacting] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Matching jobs state
  const [matchingJobs, setMatchingJobs] = useState<Task[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  useEffect(() => {
    if (offering && user?.id === offering.creator_id) {
      fetchMatchingJobs();
    }
  }, [offering, user]);

  const fetchMatchingJobs = async () => {
    if (!offering || !offering.latitude || !offering.longitude) return;
    try {
      setJobsLoading(true);
      const response = await getTasks({
        category: offering.category,
        latitude: offering.latitude,
        longitude: offering.longitude,
        radius: offering.service_radius || 50,
        status: 'open',
        per_page: 6
      });
      const filtered = (response.tasks || []).filter(t => t.creator_id !== offering.creator_id);
      setMatchingJobs(filtered);
    } catch (error) {
      console.error('Error fetching matching jobs:', error);
    } finally {
      setJobsLoading(false);
    }
  };

  const handleContact = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to contact this person');
      navigate('/login');
      return;
    }
    if (!offering) return;
    try {
      setContacting(true);
      const response = await apiClient.post('/api/messages/conversations', {
        user_id: offering.creator_id,
        message: `Hi! I'm interested in your offering: "${offering.title || 'Untitled'}"`
      });
      navigate(`/messages/${response.data.conversation.id}`);
    } catch (err: any) {
      console.error('Error starting conversation:', err);
      toast.error(err?.response?.data?.error || 'Failed to start conversation');
    } finally {
      setContacting(false);
    }
  };

  const handleBoost = async () => {
    if (!offering) return;
    boostMutation.mutate(offering.id, {
      onSuccess: (response) => {
        toast.success(response.message || 'Offering boosted! It will now appear on the map.');
      },
      onError: (err: any) => {
        console.error('Error boosting offering:', err);
        toast.error(err?.response?.data?.error || 'Failed to boost offering');
      }
    });
  };

  const offeringIcon = divIcon({
    className: 'custom-offering-icon',
    html: '<div style="background: #f59e0b; width: 20px; height: 20px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  const getBoostTimeRemaining = () => {
    if (!offering?.boost_expires_at) return null;
    const expiresAt = new Date(offering.boost_expires_at);
    const now = new Date();
    const diffMs = expiresAt.getTime() - now.getTime();
    if (diffMs <= 0) return null;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Matching Jobs Section
  const renderMatchingJobs = () => {
    if (!offering || user?.id !== offering.creator_id) return null;
    return (
      <div className="mt-3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 md:p-4 text-white">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💼</span>
            <div>
              <h2 className="text-sm md:text-base font-bold">Jobs Matching Your Service</h2>
              <p className="text-blue-100 text-xs md:text-sm">
                Open {getCategoryLabel(offering.category)} jobs near you
              </p>
            </div>
          </div>
        </div>
        <div className="p-3 md:p-4">
          {jobsLoading ? (
            <div className="text-center py-6">
              <div className="animate-spin h-6 w-6 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-gray-500 text-sm">Finding matching jobs...</p>
            </div>
          ) : matchingJobs.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <div className="text-3xl mb-1">👀</div>
              <p className="text-gray-600 font-medium text-sm">No matching jobs yet</p>
              <p className="text-xs text-gray-500 mt-1">
                No one is looking for {getCategoryLabel(offering.category)} help in your area right now.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {matchingJobs.map(job => (
                <Link
                  key={job.id}
                  to={`/tasks/${job.id}`}
                  className="block border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-base">{getCategoryIcon(job.category)}</span>
                        <h4 className="font-semibold text-gray-900 text-sm truncate">{job.title || 'Untitled'}</h4>
                        {job.is_urgent && (
                          <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">⚡</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-1 md:line-clamp-2">{job.description || ''}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-base font-bold text-green-600">€{job.budget || 0}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {matchingJobs.length > 0 && (
            <div className="mt-3 text-center">
              <Link
                to={`/tasks?tab=jobs&category=${offering.category}`}
                className="text-blue-600 hover:text-blue-700 text-xs md:text-sm font-medium"
              >
                Browse all {getCategoryLabel(offering.category)} jobs →
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Loading
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
          <div className="text-5xl mb-3">😕</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Offering Not Found</h2>
          <p className="text-gray-600 mb-4 text-sm">This offering may have been removed or is no longer available.</p>
          <Link to="/tasks" className="bg-amber-500 text-white px-5 py-2.5 rounded-lg hover:bg-amber-600 transition-colors text-sm font-semibold">
            Browse All Offerings
          </Link>
        </div>
      </div>
    );
  }

  // Safe values — guard every field that could be null
  const safeTitle = offering.title || 'Untitled Offering';
  const safeDescription = offering.description || '';
  const safeCreatorName = offering.creator_name || 'Unknown';
  const safeLocation = offering.location || '';
  const safePriceType = offering.price_type || 'fixed';
  const categoryIcon = getCategoryIcon(offering.category);
  const categoryLabel = getCategoryLabel(offering.category);
  const isOwner = user?.id === offering.creator_id;
  const boostTimeRemaining = getBoostTimeRemaining();
  const postedDate = offering.created_at
    ? new Date(offering.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';
  const priceDisplay = `€${offering.price || 0}${safePriceType === 'hourly' ? '/hr' : ''}`;

  const seoDescription = `${categoryLabel} service by ${safeCreatorName} - ${priceDisplay}${safeLocation ? ` in ${safeLocation}` : ''}. ${safeDescription.substring(0, 100)}${safeDescription.length > 100 ? '...' : ''}`;

  return (
    <div className="min-h-screen bg-gray-50 pb-36 md:pb-8">
      <SEOHead
        title={safeTitle}
        description={seoDescription}
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
            <span className="hidden md:inline">← Back to Quick Help</span>
            <span className="md:hidden">Back</span>
          </Link>
          <ShareButton
            url={`/offerings/${offering.id}`}
            title={safeTitle}
            description={`${categoryLabel} service - ${priceDisplay}`}
            size="sm"
          />
        </div>
      </div>

      <div className="px-4 pt-3 md:max-w-2xl md:mx-auto md:pt-0">
        {/* Main card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

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
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wide">
                  {categoryLabel}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-amber-600">{priceDisplay}</span>
                {safePriceType !== 'hourly' && safePriceType !== 'fixed' && (
                  <div className="text-xs text-gray-400 capitalize">{safePriceType}</div>
                )}
              </div>
            </div>
            <h1 className="text-base font-bold text-gray-900 leading-snug">{safeTitle}</h1>
          </div>

          {/* Profile row */}
          <div className="px-4 pb-3 md:px-6 md:pt-5 md:pb-5 md:border-b md:border-gray-200">
            <div className="flex items-center gap-2.5 md:gap-4">
              <Link to={`/users/${offering.creator_id}`} className="flex-shrink-0">
                {offering.creator_avatar ? (
                  <img
                    src={offering.creator_avatar}
                    alt={safeCreatorName}
                    className="w-9 h-9 md:w-12 md:h-12 rounded-full object-cover md:border-2 md:border-amber-200"
                  />
                ) : (
                  <div className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-sm md:text-lg font-bold">
                    {safeCreatorName.charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
              <div className="flex items-center gap-1.5 flex-1 min-w-0 text-sm md:flex-col md:items-start md:gap-0.5">
                <Link to={`/users/${offering.creator_id}`} className="font-semibold text-gray-900 hover:text-amber-600 truncate md:text-base">
                  {safeCreatorName}
                </Link>
                <span className="text-gray-300 md:hidden">·</span>
                {offering.creator_rating !== undefined && offering.creator_rating !== null && (
                  <div className="flex items-center gap-1">
                    <StarRating rating={offering.creator_rating} />
                    <span className="text-gray-400 text-xs">({offering.creator_review_count || 0})</span>
                  </div>
                )}
              </div>
              {!isOwner && (
                <button
                  onClick={handleContact}
                  disabled={contacting}
                  className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                  title="Send message"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
              )}
              {!isOwner && (
                <Link
                  to={`/users/${offering.creator_id}`}
                  className="text-xs md:text-sm text-amber-600 font-medium hover:text-amber-700 flex-shrink-0"
                >
                  Profile
                </Link>
              )}
              {isOwner && (
                <Link
                  to={`/offerings/${offering.id}/edit`}
                  className="text-xs md:text-sm text-amber-600 font-medium hover:text-amber-700 flex-shrink-0"
                >
                  Edit
                </Link>
              )}
            </div>
          </div>

          {/* Thin divider — mobile only */}
          <div className="border-t border-gray-100 mx-4 md:hidden" />

          {/* Description */}
          {safeDescription && (
            <div className="px-4 py-3 md:px-6 md:py-5">
              <h2 className="hidden md:block text-lg font-semibold text-gray-900 mb-3">About this service</h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                {safeDescription}
              </p>
            </div>
          )}

          {/* Info bar */}
          <div className="mx-4 mb-3 md:mx-6 md:mb-5 bg-gray-50 rounded-lg border border-gray-100">
            <div className="grid grid-cols-3 divide-x divide-gray-200">
              <div className="py-2.5 md:py-3.5 text-center">
                <div className="text-xs text-gray-400 font-medium mb-0.5">Type</div>
                <div className="text-sm md:text-base font-bold text-gray-800 capitalize">{safePriceType}</div>
              </div>
              <div className="py-2.5 md:py-3.5 text-center">
                <div className="text-xs text-gray-400 font-medium mb-0.5">Range</div>
                <div className="text-sm md:text-base font-bold text-gray-800">{offering.service_radius || 10}km</div>
              </div>
              <div className="py-2.5 md:py-3.5 text-center">
                <div className="text-xs text-gray-400 font-medium mb-0.5">Posted</div>
                <div className="text-sm md:text-base font-bold text-gray-800">{postedDate || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Experience & Availability */}
          {(offering.experience || offering.availability) && (
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
                {offering.experience && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Experience & Qualifications</h3>
                    <p className="text-sm md:text-base text-gray-700 whitespace-pre-wrap">{offering.experience}</p>
                  </div>
                )}
                {offering.availability && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Availability</h3>
                    <div className="flex items-center gap-1.5 text-sm md:text-base text-gray-700">
                      <span>📅</span>
                      <span>{offering.availability}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Boost Section */}
          {isOwner && (
            <div className="mx-4 mb-3 md:mx-6 md:mb-5 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-xs text-amber-800 flex items-center gap-1 mb-0.5">
                    🚀 Boost Visibility
                  </h3>
                  {offering.is_boost_active && boostTimeRemaining ? (
                    <p className="text-xs text-green-700 font-medium">✅ Active • {boostTimeRemaining} left</p>
                  ) : (
                    <p className="text-xs text-amber-700">Show on map for 24h</p>
                  )}
                </div>
                {offering.is_boost_active && boostTimeRemaining ? (
                  <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-lg font-bold text-xs">🔥 Boosted</span>
                ) : (
                  <button
                    onClick={handleBoost}
                    disabled={boostMutation.isPending}
                    className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all font-bold text-xs shadow-sm disabled:opacity-50"
                  >
                    {boostMutation.isPending ? '...' : '⚡ Boost'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Location map */}
          {offering.latitude && offering.longitude && (
            <div className="px-4 pb-4 md:px-6 md:pb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-sm">
                  <span>📍</span>
                  <span className="font-medium text-gray-700">{safeLocation.split(',')[0] || 'Location'}</span>
                  {offering.service_radius && (
                    <>
                      <span className="text-gray-300">·</span>
                      <span className="text-amber-600 text-xs">{offering.service_radius}km radius</span>
                    </>
                  )}
                </div>
                <a
                  href={`https://www.google.com/maps?q=${offering.latitude},${offering.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                >
                  Open in Maps →
                </a>
              </div>
              <div className="h-32 md:h-48 rounded-lg overflow-hidden border border-gray-200">
                <MapContainer
                  center={[offering.latitude, offering.longitude]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                  zoomControl={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[offering.latitude, offering.longitude]} icon={offeringIcon}>
                    <Popup>
                      <div className="text-center">
                        <p className="font-semibold text-xs">{safeTitle}</p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          )}

          {/* Desktop inline contact button */}
          {!isOwner && (
            <div className="hidden md:block px-6 pb-6">
              <button
                onClick={handleContact}
                disabled={contacting}
                className="w-full bg-amber-500 text-white py-3.5 rounded-xl hover:bg-amber-600 transition-colors disabled:bg-gray-400 font-bold text-base shadow-md"
              >
                {contacting ? 'Starting...' : `💬 Contact ${safeCreatorName.split(' ')[0]}`}
              </button>
            </div>
          )}
        </div>

        {/* Matching Jobs */}
        {renderMatchingJobs()}

        {/* How it works */}
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
      </div>

      {/* Fixed bottom action bar — MOBILE ONLY */}
      {!isOwner && (
        <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 z-40 shadow-lg md:hidden">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <button
              onClick={handleContact}
              disabled={contacting}
              className="w-full bg-amber-500 text-white py-3 rounded-xl hover:bg-amber-600 transition-colors disabled:bg-gray-400 font-bold text-sm shadow-md active:scale-[0.98]"
            >
              {contacting ? 'Starting...' : `💬 Contact ${safeCreatorName.split(' ')[0]}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferingDetail;
