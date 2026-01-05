import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getOffering, Offering } from '../api/offerings';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import apiClient from '../api/client';

// Category definitions
const CATEGORIES: Record<string, { label: string; icon: string }> = {
  'pet-care': { label: 'Pet Care', icon: '🐕' },
  'moving': { label: 'Moving', icon: '📦' },
  'shopping': { label: 'Shopping', icon: '🛒' },
  'cleaning': { label: 'Cleaning', icon: '🧹' },
  'delivery': { label: 'Delivery', icon: '📄' },
  'outdoor': { label: 'Outdoor', icon: '🌿' },
  'babysitting': { label: 'Babysitting', icon: '👶' },
  'car-wash': { label: 'Car Wash', icon: '🚗' },
  'assembly': { label: 'Assembly', icon: '🔧' },
  'plumbing': { label: 'Plumbing', icon: '🔧' },
  'repair': { label: 'Repair', icon: '🛠️' },
};

// Helper function to render star rating
const StarRating = ({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  const sizeClass = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-lg';
  
  return (
    <span className={`text-yellow-500 ${sizeClass}`}>
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
  
  const [offering, setOffering] = useState<Offering | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contacting, setContacting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOffering();
    }
  }, [id]);

  const fetchOffering = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOffering(parseInt(id!, 10));
      setOffering(data);
    } catch (err: any) {
      console.error('Error fetching offering:', err);
      setError(err?.response?.data?.error || 'Failed to load offering');
    } finally {
      setLoading(false);
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
      const response = await apiClient.post('/api/messages/conversations', {
        participant_id: offering.creator_id,
        initial_message: `Hi! I'm interested in your offering: "${offering.title}"`
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

  const offeringIcon = divIcon({
    className: 'custom-offering-icon',
    html: '<div style="background: #f59e0b; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

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

  if (error || !offering) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Offering Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'This offering may have been removed or is no longer available.'}</p>
          <Link to="/tasks" className="bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors">
            Browse All Offerings
          </Link>
        </div>
      </div>
    );
  }

  const category = CATEGORIES[offering.category] || { label: offering.category, icon: '💼' };
  const isOwner = user?.id === offering.creator_id;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
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
                <span className="text-4xl">{category.icon}</span>
                <div>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                    {category.label}
                  </span>
                  <h1 className="text-2xl md:text-3xl font-bold mt-2">{offering.title}</h1>
                </div>
              </div>
              <div className="text-right">
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
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Creator Info */}
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
              {!isOwner && (
                <button
                  onClick={handleContact}
                  disabled={contacting}
                  className="bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors disabled:bg-gray-400 font-medium"
                >
                  {contacting ? 'Starting chat...' : '💬 Contact'}
                </button>
              )}
              {isOwner && (
                <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm">
                  This is your offering
                </span>
              )}
            </div>

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
                {offering.service_radius && (
                  <span className="text-amber-600">• {offering.service_radius}km service radius</span>
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
                <div className="font-semibold">{offering.service_radius || 10}km</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">📅</div>
                <div className="text-sm text-gray-500">Posted</div>
                <div className="font-semibold">
                  {new Date(offering.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              {!isOwner && (
                <button
                  onClick={handleContact}
                  disabled={contacting}
                  className="flex-1 bg-amber-500 text-white py-4 rounded-lg hover:bg-amber-600 transition-colors disabled:bg-gray-400 font-semibold text-lg"
                >
                  {contacting ? 'Starting conversation...' : '💬 Contact ' + (offering.creator_name?.split(' ')[0] || 'Seller')}
                </button>
              )}
              <Link
                to={`/users/${offering.creator_id}`}
                className={`${isOwner ? 'flex-1' : ''} px-6 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center`}
              >
                👤 View Profile
              </Link>
            </div>
          </div>
        </div>

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
