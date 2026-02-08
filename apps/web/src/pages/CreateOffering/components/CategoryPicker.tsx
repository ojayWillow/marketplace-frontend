import { CATEGORIES, CATEGORY_GROUPS, getCategoryByValue } from '../../../constants/categories';

interface CategoryPickerProps {
  value: string;
  onChange: (category: string) => void;
}

const CategoryPicker = ({ value, onChange }: CategoryPickerProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-3">
      What service do you offer? *
    </label>

    {CATEGORY_GROUPS.map(group => (
      <div key={group.name} className="mb-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{group.name}</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {group.categories.map(catValue => {
            const cat = getCategoryByValue(catValue);
            if (!cat) return null;
            const isSelected = value === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => onChange(cat.value)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50 shadow-sm scale-[1.02]'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className={`text-xs font-medium leading-tight ${
                  isSelected ? 'text-amber-700' : 'text-gray-700'
                }`}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    ))}

    {value && (
      <p className="text-xs text-gray-500 mt-1">
        {getCategoryByValue(value)?.icon} {getCategoryByValue(value)?.description}
      </p>
    )}
  </div>
);

export default CategoryPicker;
