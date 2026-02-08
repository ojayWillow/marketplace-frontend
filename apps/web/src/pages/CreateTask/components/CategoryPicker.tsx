import { useTranslation } from 'react-i18next';
import { CATEGORY_GROUPS, getCategoryByValue } from '../../../constants/categories';

interface CategoryPickerProps {
  value: string;
  onChange: (category: string) => void;
}

const CategoryPicker = ({ value, onChange }: CategoryPickerProps) => {
  const { t } = useTranslation();

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {t('createTask.category', 'Category')} *
      </label>
      {CATEGORY_GROUPS.map(group => (
        <div key={group.name} className="mb-2.5">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{group.name}</p>
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
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
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
        <p className="text-xs text-gray-500 mt-1">
          {getCategoryByValue(value)?.icon} {getCategoryByValue(value)?.description}
        </p>
      )}
    </div>
  );
};

export default CategoryPicker;
