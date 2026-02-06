import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getImageUrl, useAuthStore } from '@marketplace/shared';
import type { UserProfile, ProfileFormData } from '@marketplace/shared';

interface ProfileHeaderProps {
  profile: UserProfile;
  formData: ProfileFormData;
  editing: boolean;
  saving: boolean;
  totalTasksCompleted: number;
  viewOnly?: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onChangeAvatar: () => void;
  onMessage?: () => void;
  messageLoading?: boolean;
}

export const ProfileHeader = ({
  profile,
  formData,
  editing,
  saving,
  totalTasksCompleted,
  viewOnly = false,
  onEdit,
  onCancel,
  onSave,
  onChangeAvatar,
  onMessage,
  messageLoading = false,
}: ProfileHeaderProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { clearAuth } = useAuthStore();

  const memberSince = new Date(profile.created_at).toLocaleDateString(
    i18n.language === 'lv' ? 'lv-LV' : i18n.language === 'ru' ? 'ru-RU' : 'en-US',
    {
      year: 'numeric',
      month: 'long'
    }
  );

  // Helper to get full avatar URL
  const getAvatarDisplayUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    return getImageUrl(url);
  };

  const currentAvatarUrl = getAvatarDisplayUrl(
    viewOnly ? (profile.avatar_url || profile.profile_picture_url) : (formData.avatar_url || profile.avatar_url || profile.profile_picture_url)
  );

  const handleLogout = () => {
    clearAuth();
    navigate('/welcome');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden ring-4 ring-gray-50">
            {currentAvatarUrl ? (
              <img 
                src={currentAvatarUrl} 
                alt={profile.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl text-gray-400 font-semibold">
                {profile.username.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          {profile.is_verified && (
            <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1 shadow border-2 border-white">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          {!viewOnly && editing && (
            <button
              onClick={onChangeAvatar}
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-0.5 rounded-full text-xs hover:bg-gray-700 transition-colors"
            >
              {t('profile.changeAvatar')}
            </button>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-gray-900">{profile.username}</h1>
            {profile.is_verified && (
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full font-medium">
                ✓ {t('profile.verified')}
              </span>
            )}
          </div>
          
          {(profile.first_name || profile.last_name) && (
            <p className="text-gray-600">{profile.first_name} {profile.last_name}</p>
          )}
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
            {(profile.city || profile.country) && (
              <span className="flex items-center gap-1">
                📍 {[profile.city, profile.country].filter(Boolean).join(', ')}
              </span>
            )}
            <span>{t('profile.memberSince', { date: memberSince })}</span>
          </div>

          {/* Stats inline */}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">★</span>
              <span className="font-semibold text-gray-900">{profile.average_rating?.toFixed(1) || '0.0'}</span>
              <span className="text-gray-400 text-sm">({profile.reviews_count || 0})</span>
            </div>
            <div className="text-gray-300">|</div>
            <div className="flex items-center gap-1">
              <span className="text-green-500 font-semibold">{profile.tasks_completed || totalTasksCompleted}</span>
              <span className="text-gray-500 text-sm">{t('profile.tasksDone')}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex-shrink-0">
          {viewOnly ? (
            // Public profile - show Message button
            onMessage && (
              <button
                onClick={onMessage}
                disabled={messageLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:bg-gray-400 flex items-center gap-2"
              >
                💬 {messageLoading ? t('profile.messageLoading') : t('profile.message')}
              </button>
            )
          ) : (
            // Own profile - show Edit/Logout buttons
            !editing ? (
              <div className="flex flex-col gap-2">
                <button
                  onClick={onEdit}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  {t('profile.editProfile')}
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                >
                  🚪 Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  {t('profile.cancel')}
                </button>
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {saving ? t('profile.saving') : t('profile.save')}
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {/* Quick Actions - Only show for own profile */}
      {!viewOnly && (
        <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-gray-100">
          <Link
            to="/tasks/create"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors"
          >
            📋 {t('profile.quickActions.postJob')}
          </Link>
          <Link
            to="/offerings/create"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm font-medium hover:bg-amber-100 transition-colors"
          >
            👋 {t('profile.quickActions.offerService')}
          </Link>
          <Link
            to="/listings/create"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-100 transition-colors"
          >
            🏷️ {t('profile.quickActions.sellItem')}
          </Link>
          <Link
            to="/favorites"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 text-pink-700 rounded-full text-sm font-medium hover:bg-pink-100 transition-colors"
          >
            ❤️ {t('profile.quickActions.favorites')}
          </Link>
        </div>
      )}
    </div>
  );
};
