import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Offering } from '../api/offerings';
import { getTasks, Task } from '../api/tasks';
import { useOffering, useBoostOffering } from '../api/hooks';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import { getCategoryIcon, getCategoryLabel } from '../constants/categories';
import apiClient from '../api/client';
import ShareButton from '../components/ui/ShareButton';
import SEOHead from '../components/ui/SEOHead';
import StarRating from '../components/ui/StarRating';

const OfferingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const toast = useToastStore();
  
  // React Query for offering data
  const { data: offering, isLoading: loading, error: queryError, refetch } = useOffering(Number(id));
  const boostMutation = useBoostOffering();
  
  const [contacting, setContacting] = useState(false);
  
  // Matching jobs state
  const [matchingJobs, setMatchingJobs] = useState<Task[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  useEffect(() => {
    // Fetch matching jobs when offering is loaded and user is the owner
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
        radius: (offering as any).service_radius || 50,
        status: 'open',
        per_page: 6
      });
      // Filter out jobs created by the offering owner
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
      // Create or get existing conversation with the offering creator
      // Backend expects: user_id, message (optional), task_id (optional)
      const response = await apiClient.post('/api/messages/conversations', {
        user_id: offering.creator_id,
        message: `Hi! I'm interested in your offering: "${offering.title}"`
      });
      
      // Navigate to the conversation
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
    html: '<div style="background: #f59e0b; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  // Calculate boost time remaining
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

  // Render Matching Jobs Section
  const renderMatchingJobs = () => {
    if (!offering || user?.id !== offering.creator_id) return null;

    return (
      <div className="mt-6 bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header with explanation */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💼</span>
            <div>
              <h2 className="text-lg font-bold">Jobs Matching Your Service</h2>
              <p className="text-blue-100 text-sm">
                Open <strong>{getCategoryLabel(offering.category)}</strong> jobs near your service area
              </p>
            </div>
          </div>
        </div>

        <div className="p-4">
          {/* Explanation box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">
              <strong>💡 How matching works:</strong> These are jobs posted by people looking for <strong>{getCategoryLabel(offering.category)}</strong> help within your service radius. 
              Apply directly or wait for them to find your offering!
            </p>
          </div>

          {jobsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-gray-500">Finding matching jobs...</p>
            </div>
          ) : matchingJobs.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-2">👀</div>
              <p className="text-gray-600 font-medium">No matching jobs yet</p>
              <p className="text-sm text-gray-500 mt-1">
                No one is looking for {getCategoryLabel(offering.category)} help in your area right now.
                <br />Don't worry — people can still find and contact you through your offering!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {matchingJobs.map(job => (
                <Link 
                  key={job.id} 
                  to={`/tasks/${job.id}`}
                  className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{getCategoryIcon(job.category)}</span>
                        <h4 className="font-semibold text-gray-900">{job.title}</h4>
                        {job.is_urgent && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">⚡ Urgent</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{job.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>📍 {job.location?.split(',')[0] || 'Unknown'}</span>
                        {job.distance && <span>• {job.distance.toFixed(1)}km away</span>}
                        <span>• Posted by {job.creator_name || 'Someone'}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xl font-bold text-green-600">€{job.budget || 0}</div>
                      <span className="text-xs text-gray-500">Budget</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Browse more link */}
          {matchingJobs.length > 0 && (
            <div className="mt-4 text-center">
              <Link 
                to={`/tasks?tab=jobs&category=${offering.category}`}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Browse all {getCategoryLabel(offering.category)} jobs →
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading offering...</p>
        </div>
      </div>
    );
  }

  if (queryError || !offering) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Offering Not Found</h2>
          <p className="text-gray-600 mb-4">This offering may have been removed or is no longer available.</p>
          <Link to="/tasks" className="bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors">
            Browse All Offerings
          </Link>
        </div>
      </div>
    );
  }

  const categoryIcon = getCategoryIcon(offering.category);
  const categoryLabel = getCategoryLabel(offering.category);
  const isOwner = user?.id === offering.creator_id;
  const boostTimeRemaining = getBoostTimeRemaining();

  // Build SEO description
  const seoDescription = `${categoryLabel} service by ${offering.creator_name} - €${offering.price || 0}${offering.price_type === 'hourly' ? '/hr' : ''}${offering.location ? ` in ${offering.location}` : ''}. ${offering.description?.substring(0, 100)}...`;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* SEO Meta Tags */}
      <SEOHead
        title={offering.title}
        description={seoDescription}
        url={`/offerings/${offering.id}`}
        type="product"
        price={offering.price}
      />

      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <Link to="/tasks" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <span className="mr-2">←</span> Back to Quick Help
        </Link>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{categoryIcon}</span>
                <div>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                    {categoryLabel}
                  </span>
                  <h1 className="text-2xl md:text-3xl font-bold mt-2">{offering.title}</h1>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <div className="text-3xl font-bold">
                  €{offering.price || 0}
                  {offering.price_type === 'hourly' && <span className="text-lg">/hr</span>}
                </div>
                {offering.price_type === 'negotiable' && (
                  <span className="text-amber-100 text-sm">Negotiable</span>
                )}
                {offering.price_type === 'fixed' && (
                  <span className="text-amber-100 text-sm">Fixed price</span>
                )}
                {/* Share Button */}
                <ShareButton
                  url={`/offerings/${offering.id}`}
                  title={offering.title}
                  description={`${categoryLabel} service - €${offering.price || 0}${offering.price_type === 'hourly' ? '/hr' : ''}${offering.location ? ` in ${offering.location}` : ''}`}
                  size="sm"
                  className="!bg-white/20 !border-white/30 !text-white hover:!bg-white/30"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Creator Info - View Profile button only */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b">
              <Link to={`/users/${offering.creator_id}`} className="flex-shrink-0">
                {offering.creator_avatar ? (
                  <img 
                    src={offering.creator_avatar} 
                    alt={offering.creator_name} 
                    className="w-16 h-16 rounded-full object-cover border-2 border-amber-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-2xl font-bold">
                    {offering.creator_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
              </Link>
              <div className="flex-1">
                <Link to={`/users/${offering.creator_id}`} className="font-semibold text-lg text-gray-900 hover:text-amber-600">
                  {offering.creator_name}
                </Link>
                {offering.creator_rating !== undefined && (
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={offering.creator_rating} />
                    <span className="text-gray-500">
                      {offering.creator_rating.toFixed(1)} ({offering.creator_review_count || 0} reviews)
                    </span>
                  </div>
                )}
              </div>
              {/* View Profile button in header area */}
              <Link
                to={`/users/${offering.creator_id}`}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                👤 View Profile
              </Link>
            </div>

            {/* Boost Section - Only for owners */}
            {isOwner && (
              <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="font-semibold text-amber-800 flex items-center gap-2">
                      🚀 Boost Your Visibility
                    </h3>
                    {offering.is_boost_active && boostTimeRemaining ? (
                      <p className="text-sm text-green-700 mt-1">
                        ✅ <strong>Boost active!</strong> Your offering is visible on the map. 
                        <span className="ml-1">⏱️ {boostTimeRemaining} remaining</span>
                      </p>
                    ) : (
                      <p className="text-sm text-amber-700 mt-1">
                        Show your offering on the Quick Help map so customers can find you easily!
                      </p>
                    )}
                  </div>
                  {offering.is_boost_active && boostTimeRemaining ? (
                    <div className="flex items-center gap-2">
                      <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium text-sm">
                        🔥 Boosted
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={handleBoost}
                      disabled={boostMutation.isPending}
                      className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all font-semibold shadow-md disabled:opacity-50"
                    >
                      {boostMutation.isPending ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                          Activating...
                        </span>
                      ) : (
                        '🚀 Activate 24h Free Trial'
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">About this service</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {offering.description}
              </p>
            </div>

            {/* Experience */}
            {offering.experience && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Experience & Qualifications</h2>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {offering.experience}
                </p>
              </div>
            )}

            {/* Availability */}
            {offering.availability && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Availability</h2>
                <div className="flex items-center gap-2 text-gray-700">
                  <span>📅</span>
                  <span>{offering.availability}</span>
                </div>
              </div>
            )}

            {/* Location Map */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Service Area</h2>
              <div className="flex items-center gap-2 text-gray-600 mb-3">
                <span>📍</span>
                <span>{offering.location || 'Location not specified'}</span>
                {(offering as any).service_radius && (
                  <span className="text-amber-600">• {(offering as any).service_radius}km service radius</span>
                )}
              </div>
              {offering.latitude && offering.longitude && (
                <div className="h-64 rounded-lg overflow-hidden border border-gray-200">
                  <MapContainer
                    center={[offering.latitude, offering.longitude]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[offering.latitude, offering.longitude]} icon={offeringIcon}>
                      <Popup>
                        <div className="text-center">
                          <p className="font-semibold">{offering.title}</p>
                          <p className="text-sm text-gray-500">Service location</p>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl mb-1">💰</div>
                <div className="text-sm text-gray-500">Price</div>
                <div className="font-semibold">€{offering.price || 0}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">📋</div>
                <div className="text-sm text-gray-500">Type</div>
                <div className="font-semibold capitalize">{offering.price_type || 'Fixed'}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">📍</div>
                <div className="text-sm text-gray-500">Range</div>
                <div className="font-semibold">{(offering as any).service_radius || 10}km</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">📅</div>
                <div className="text-sm text-gray-500">Posted</div>
                <div className="font-semibold">
                  {new Date(offering.created_at!).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Action Button - Only Contact button at bottom for non-owners */}
            {!isOwner && (
              <button
                onClick={handleContact}
                disabled={contacting}
                className="w-full bg-amber-500 text-white py-4 rounded-lg hover:bg-amber-600 transition-colors disabled:bg-gray-400 font-semibold text-lg"
              >
                {contacting ? 'Starting conversation...' : '💬 Contact ' + (offering.creator_name?.split(' ')[0] || 'Seller')}
              </button>
            )}
          </div>
        </div>

        {/* Matching Jobs Section - Only for offering owner */}
        {renderMatchingJobs()}

        {/* Related Info */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-semibold text-amber-800 mb-2">💡 How it works</h3>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• Contact the service provider to discuss your needs</li>
            <li>• Agree on scope, timing, and price</li>
            <li>• Service provider comes to you or meets at agreed location</li>
            <li>• Pay after the service is completed to your satisfaction</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OfferingDetail;
