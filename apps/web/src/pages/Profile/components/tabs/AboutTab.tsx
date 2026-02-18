import { useTranslation } from 'react-i18next';
import type { UserProfile, ProfileFormData } from '@marketplace/shared';
import { COUNTRIES, CITIES, AVAILABLE_SKILLS, getLocalizedLabel } from '../../../../constants/locations';

interface AboutTabProps {
  profile: UserProfile;
  editing: boolean;
  formData: ProfileFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onFormDataChange?: (updates: Partial<ProfileFormData>) => void;
  viewOnly?: boolean;
}

export const AboutTab = ({ profile, editing, formData, onChange, onFormDataChange, viewOnly = false }: AboutTabProps) => {
  const { t, i18n } = useTranslation();

  const isPlaceholderEmail = (email: string) => {
    return email.includes('@phone.tirgus.local');
  };

  const displayEmail = profile.email && !isPlaceholderEmail(profile.email) ? profile.email : null;

  const availableCities = formData.country ? (CITIES[formData.country] || []) : [];

  const currentSkills = formData.skills
    ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onFormDataChange) {
      onFormDataChange({ country: e.target.value, city: '' });
    } else {
      onChange(e);
    }
  };

  const toggleSkill = (skillKey: string) => {
    let newSkills: string[];
    if (currentSkills.includes(skillKey)) {
      newSkills = currentSkills.filter(s => s !== skillKey);
    } else {
      newSkills = [...currentSkills, skillKey];
    }
    if (onFormDataChange) {
      onFormDataChange({ skills: newSkills.join(', ') });
    }
  };

  if (!viewOnly && editing) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('profile.firstName')}</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('profile.lastName')}</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('profile.bio')}</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={onChange}
              rows={3}
              placeholder={t('profile.bioPlaceholder')}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('profile.phone')}</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={onChange}
              placeholder={t('profile.phonePlaceholder')}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('profile.country')}</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleCountryChange}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t('profile.selectCountry', 'Select country')}</option>
                {COUNTRIES.map(c => (
                  <option key={c.value} value={c.value}>
                    {getLocalizedLabel(c.label, i18n.language)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('profile.city')}</label>
              <select
                name="city"
                value={formData.city}
                onChange={onChange}
                disabled={!formData.country}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-500"
              >
                <option value="">{formData.country ? t('profile.selectCity', 'Select city') : t('profile.selectCountryFirst', 'Select country first')}</option>
                {availableCities.map(c => (
                  <option key={c.value} value={c.value}>
                    {getLocalizedLabel(c.label, i18n.language)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('profile.skills', 'What can you help with?')}
            </label>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
              {t('profile.skillsHint', 'Select categories that match your skills. These help people find you.')}
            </p>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SKILLS.map(skill => {
                const isSelected = currentSkills.includes(skill.key);
                return (
                  <button
                    key={skill.key}
                    type="button"
                    onClick={() => toggleSkill(skill.key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 shadow-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <span>{skill.icon}</span>
                    <span>{t(`tasks.categories.${skill.key}`, skill.label)}</span>
                    {isSelected && <span className="text-blue-400 ml-0.5">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displaySkills = profile.skills
    ? profile.skills.split(',').map(s => s.trim()).filter(Boolean).map(key => {
        const found = AVAILABLE_SKILLS.find(sk => sk.key === key);
        return found || { key, label: key, icon: '📋' };
      })
    : [];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <div className="space-y-5">
        {profile.bio ? (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t('profile.about')}</h3>
            <p className="text-gray-700 dark:text-gray-300">{profile.bio}</p>
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {viewOnly ? t('profile.noBioViewOnly') : t('profile.noBio')}
            </p>
          </div>
        )}

        {displaySkills.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t('profile.skills', 'Skills')}</h3>
            <div className="flex flex-wrap gap-1.5">
              {displaySkills.map((skill, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm rounded-full font-medium">
                  <span>{skill.icon}</span> {t(`tasks.categories.${skill.key}`, skill.label)}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {!viewOnly && (displayEmail || profile.phone) && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">{t('profile.contact')}</h3>
            <div className="space-y-2">
              {displayEmail && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-400">📧</span>
                  <span className="text-gray-700 dark:text-gray-300">{displayEmail}</span>
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-400">📱</span>
                  <span className="text-gray-700 dark:text-gray-300">{profile.phone}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {(profile.city || profile.country) && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">{t('profile.location')}</h3>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-400">📍</span>
              <span className="text-gray-700 dark:text-gray-300">{[profile.city, profile.country].filter(Boolean).join(', ')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
