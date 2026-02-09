import { useState } from 'react';
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
  const [skillInput, setSkillInput] = useState('');

  // Helper to check if email is a placeholder (auto-generated for phone users)
  const isPlaceholderEmail = (email: string) => {
    return email.includes('@phone.tirgus.local');
  };

  // Get display email (null if it's a placeholder)
  const displayEmail = profile.email && !isPlaceholderEmail(profile.email) ? profile.email : null;

  // Get available cities for selected country
  const availableCities = formData.country ? (CITIES[formData.country] || []) : [];

  // Parse current skills
  const currentSkills = formData.skills
    ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // When country changes, reset city
    if (onFormDataChange) {
      onFormDataChange({ country: e.target.value, city: '' });
    } else {
      // Fallback: use standard onChange
      onChange(e);
    }
  };

  const addSkill = (skill: string) => {
    if (!skill.trim()) return;
    const trimmed = skill.trim();
    if (currentSkills.includes(trimmed)) return;
    const newSkills = [...currentSkills, trimmed].join(', ');
    if (onFormDataChange) {
      onFormDataChange({ skills: newSkills });
    }
    setSkillInput('');
  };

  const removeSkill = (skillToRemove: string) => {
    const newSkills = currentSkills.filter(s => s !== skillToRemove).join(', ');
    if (onFormDataChange) {
      onFormDataChange({ skills: newSkills });
    }
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(skillInput);
    }
  };

  // Filter suggestions
  const skillSuggestions = skillInput.length > 0
    ? AVAILABLE_SKILLS.filter(
        s => s.toLowerCase().includes(skillInput.toLowerCase()) && !currentSkills.includes(s)
      )
    : [];

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
          
          {/* Country & City dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.country')}</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleCountryChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.city')}</label>
              <select
                name="city"
                value={formData.city}
                onChange={onChange}
                disabled={!formData.country}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:text-gray-400"
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

          {/* Skills section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🛠️ {t('profile.skills', 'Skills')}
            </label>
            
            {/* Current skills pills */}
            {currentSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {currentSkills.map((skill, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-sm rounded-full font-medium"
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="text-blue-400 hover:text-blue-600 ml-0.5"
                      type="button"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Skill input */}
            <div className="relative">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder={t('profile.skillsPlaceholder', 'Type a skill or choose below...')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              {/* Autocomplete dropdown */}
              {skillSuggestions.length > 0 && (
                <div className="absolute z-10 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {skillSuggestions.map(suggestion => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => addSkill(suggestion)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick-add popular skills (when input is empty) */}
            {skillInput.length === 0 && currentSkills.length < 8 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {AVAILABLE_SKILLS
                  .filter(s => !currentSkills.includes(s))
                  .slice(0, 8)
                  .map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => addSkill(skill)}
                      className="px-2 py-0.5 text-xs text-gray-500 border border-gray-200 rounded-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                    >
                      + {skill}
                    </button>
                  ))}
              </div>
            )}
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

        {/* Skills display */}
        {profile.skills && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">🛠️ {t('profile.skills', 'Skills')}</h3>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.split(',').map((skill, i) => (
                <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-sm rounded-full font-medium">
                  {skill.trim()}
                </span>
              ))}
            </div>
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
