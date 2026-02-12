import { CATEGORY_GROUPS, getCategoryByValue } from '../../../constants/categories';

interface CategoryPickerProps {
  value: string;
  onChange: (category: string) => void;
}

const CategoryPicker = ({ value, onChange }: CategoryPickerProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      What service do you offer? *
    </label>

    {CATEGORY_GROUPS.map(group => (
      <div key={group.name} className="mb-2.5">
        <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">{group.name}</p>
        <div className="flex flex-wrap gap-1.5">
          {group.categories.map(catValue => {
            const cat = getCategoryByValue(catValue);
            if (!cat) return null;
            const isSelected = value === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => onChange(cat.value)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-all text-xs font-medium ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 shadow-sm'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <span className="text-sm">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    ))}

    {value && (
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {getCategoryByValue(value)?.icon} {getCategoryByValue(value)?.description}
      </p>
    )}
  </div>
);

export default CategoryPicker;
