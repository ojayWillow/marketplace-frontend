import { useTranslation } from 'react-i18next';
import type { UserProfile, ProfileFormData } from '@marketplace/shared';

interface AboutTabProps {
  profile: UserProfile;
  editing: boolean;
  formData: ProfileFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  viewOnly?: boolean;
}

export const AboutTab = ({ profile, editing, formData, onChange, viewOnly = false }: AboutTabProps) => {
  const { t } = useTranslation();

  // Helper to check if email is a placeholder (auto-generated for phone users)
  const isPlaceholderEmail = (email: string) => {
    return email.includes('@phone.tirgus.local');
  };

  // Get display email (null if it's a placeholder)
  const displayEmail = profile.email && !isPlaceholderEmail(profile.email) ? profile.email : null;

  if (!viewOnly && editing) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.firstName')}</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.lastName')}</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.bio')}</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={onChange}
              rows={3}
              placeholder={t('profile.bioPlaceholder')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.phone')}</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={onChange}
              placeholder={t('profile.phonePlaceholder')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.city')}</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={onChange}
                placeholder={t('profile.cityPlaceholder')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.country')}</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={onChange}
                placeholder={t('profile.countryPlaceholder')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="space-y-5">
        {profile.bio ? (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">{t('profile.about')}</h3>
            <p className="text-gray-700">{profile.bio}</p>
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-sm">
              {viewOnly ? t('profile.noBioViewOnly') : t('profile.noBio')}
            </p>
          </div>
        )}
        
        {/* Contact info - only show for own profile */}
        {!viewOnly && (displayEmail || profile.phone) && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">{t('profile.contact')}</h3>
            <div className="space-y-2">
              {displayEmail && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-400">📧</span>
                  <span className="text-gray-700">{displayEmail}</span>
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-400">📱</span>
                  <span className="text-gray-700">{profile.phone}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Location info - show for everyone if available */}
        {(profile.city || profile.country) && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">{t('profile.location')}</h3>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-400">📍</span>
              <span className="text-gray-700">{[profile.city, profile.country].filter(Boolean).join(', ')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
