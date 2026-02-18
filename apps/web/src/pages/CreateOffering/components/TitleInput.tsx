import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCategoryByValue } from '../../../constants/categories';

interface TitleInputProps {
  value: string;
  category: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect: (title: string) => void;
}

const TITLE_SUGGESTIONS: Record<string, string[]> = {
  cleaning: ['suggestions.cleaning.0', 'suggestions.cleaning.1', 'suggestions.cleaning.2', 'suggestions.cleaning.3'],
  moving: ['suggestions.moving.0', 'suggestions.moving.1', 'suggestions.moving.2'],
  assembly: ['suggestions.assembly.0', 'suggestions.assembly.1', 'suggestions.assembly.2'],
  handyman: ['suggestions.handyman.0', 'suggestions.handyman.1', 'suggestions.handyman.2'],
  plumbing: ['suggestions.plumbing.0', 'suggestions.plumbing.1', 'suggestions.plumbing.2'],
  electrical: ['suggestions.electrical.0', 'suggestions.electrical.1', 'suggestions.electrical.2'],
  painting: ['suggestions.painting.0', 'suggestions.painting.1', 'suggestions.painting.2'],
  outdoor: ['suggestions.outdoor.0', 'suggestions.outdoor.1', 'suggestions.outdoor.2'],
  delivery: ['suggestions.delivery.0', 'suggestions.delivery.1', 'suggestions.delivery.2'],
  care: ['suggestions.care.0', 'suggestions.care.1', 'suggestions.care.2'],
  tutoring: ['suggestions.tutoring.0', 'suggestions.tutoring.1', 'suggestions.tutoring.2'],
  tech: ['suggestions.tech.0', 'suggestions.tech.1', 'suggestions.tech.2'],
  beauty: ['suggestions.beauty.0', 'suggestions.beauty.1', 'suggestions.beauty.2'],
  events: ['suggestions.events.0', 'suggestions.events.1', 'suggestions.events.2'],
  other: ['suggestions.other.0', 'suggestions.other.1', 'suggestions.other.2'],
};

const TITLE_SUGGESTIONS_FALLBACKS: Record<string, string[]> = {
  cleaning: ['Professional House Cleaning', 'Deep Cleaning Service', 'Office Cleaning', 'Move-out Cleaning'],
  moving: ['Moving & Heavy Lifting Help', 'Furniture Moving Service', 'Apartment Moving Help'],
  assembly: ['Furniture Assembly (IKEA & more)', 'Shelf & Cabinet Mounting', 'Flat-pack Assembly Service'],
  handyman: ['Handyman \u2013 All Repairs', 'Home Repair Service', 'Fix-It Handyman'],
  plumbing: ['Plumbing Repairs & Installation', 'Emergency Plumber', 'Faucet & Drain Service'],
  electrical: ['Electrical Repairs & Wiring', 'Light Fixture Installation', 'Outlet & Switch Service'],
  painting: ['Interior Wall Painting', 'Room Painting Service', 'Touch-up & Decorating'],
  outdoor: ['Garden & Yard Maintenance', 'Lawn Mowing & Trimming', 'Snow Removal Service'],
  delivery: ['Delivery & Errands Runner', 'Grocery Shopping & Delivery', 'Package Pickup & Drop-off'],
  care: ['Pet Walking & Sitting', 'Babysitting / Childcare', 'Elderly Companion Care'],
  tutoring: ['Math & Science Tutoring', 'Language Lessons', 'Homework Help & Tutoring'],
  tech: ['Computer & Phone Repair', 'WiFi & Smart Home Setup', 'Tech Support & Troubleshooting'],
  beauty: ['Hairstyling & Cuts', 'Makeup Artist', 'At-Home Beauty Services'],
  events: ['Event Setup & Decorations', 'Party Planning Help', 'Catering Assistant'],
  other: ['General Helper', 'Personal Assistant', 'Custom Service'],
};

const TitleInput = ({ value, category, onChange, onSelect }: TitleInputProps) => {
  const { t } = useTranslation();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const keys = category ? (TITLE_SUGGESTIONS[category] || TITLE_SUGGESTIONS['other']) : [];
  const fallbacks = category ? (TITLE_SUGGESTIONS_FALLBACKS[category] || TITLE_SUGGESTIONS_FALLBACKS['other']) : [];
  const suggestions = keys.map((key, i) => t(`createOffering.${key}`, fallbacks[i] || ''));
  const catInfo = getCategoryByValue(category);

  return (
    <div>
      <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {t('createOffering.offeringTitle', 'Service Title')} *
      </label>
      <input
        type="text"
        id="title"
        name="title"
        required
        value={value}
        onChange={onChange}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={catInfo ? `${t('createOffering.egPrefix', 'e.g.')} ${suggestions[0] || t('createOffering.describeService', 'Describe your service')}` : t('createOffering.selectCategoryFirst', 'First select a category above')}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-base sm:text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />

      {showSuggestions && !value && category && suggestions.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {suggestions.map(s => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); onSelect(s); setShowSuggestions(false); }}
              className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-700 dark:hover:text-amber-300 text-gray-600 dark:text-gray-300 rounded-full text-[11px] font-medium transition-colors border border-gray-200 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-600"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TitleInput;
