import { useState } from 'react';
import { getCategoryByValue } from '../../../constants/categories';

interface TitleInputProps {
  value: string;
  category: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect: (title: string) => void;
}

const TITLE_SUGGESTIONS: Record<string, string[]> = {
  cleaning: ['Professional House Cleaning', 'Deep Cleaning Service', 'Office Cleaning', 'Move-out Cleaning'],
  moving: ['Moving & Heavy Lifting Help', 'Furniture Moving Service', 'Apartment Moving Help'],
  assembly: ['Furniture Assembly (IKEA & more)', 'Shelf & Cabinet Mounting', 'Flat-pack Assembly Service'],
  handyman: ['Handyman – All Repairs', 'Home Repair Service', 'Fix-It Handyman'],
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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestions = category ? (TITLE_SUGGESTIONS[category] || TITLE_SUGGESTIONS['other']) : [];
  const catInfo = getCategoryByValue(category);

  return (
    <div>
      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
        Service Title *
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
        placeholder={catInfo ? `e.g., ${suggestions[0] || 'Describe your service'}` : 'First select a category above'}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
      />

      {/* Smart suggestions */}
      {showSuggestions && !value && category && suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="text-xs text-gray-400 w-full mb-0.5">💡 Quick pick:</span>
          {suggestions.map(suggestion => (
            <button
              key={suggestion}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(suggestion);
                setShowSuggestions(false);
              }}
              className="px-3 py-1 bg-gray-100 hover:bg-amber-50 hover:text-amber-700 text-gray-700 rounded-full text-xs font-medium transition-colors border border-gray-200 hover:border-amber-300"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-1">Make it clear and descriptive</p>
    </div>
  );
};

export default TitleInput;
