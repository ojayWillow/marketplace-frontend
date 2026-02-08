import { useTranslation } from 'react-i18next';
import { DIFFICULTIES } from '../types';

interface DifficultyPickerProps {
  value: string;
  onChange: (difficulty: string) => void;
}

const DifficultyPicker = ({ value, onChange }: DifficultyPickerProps) => {
  const { t } = useTranslation();

  const colorMap: Record<string, { selected: string; hover: string }> = {
    green: { selected: 'border-green-500 bg-green-50 text-green-700 shadow-sm', hover: 'hover:border-green-300' },
    amber: { selected: 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm', hover: 'hover:border-amber-300' },
    red: { selected: 'border-red-500 bg-red-50 text-red-700 shadow-sm', hover: 'hover:border-red-300' },
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {t('createTask.difficulty', 'How hard is this task?')}
      </label>
      <div className="flex gap-2">
        {DIFFICULTIES.map(diff => {
          const isSelected = value === diff.value;
          const colors = colorMap[diff.color];
          return (
            <button
              key={diff.value}
              type="button"
              onClick={() => onChange(diff.value)}
              className={`flex-1 px-3 py-2 rounded-lg border transition-all text-xs font-medium text-center ${
                isSelected
                  ? colors.selected
                  : `border-gray-200 bg-white text-gray-600 ${colors.hover}`
              }`}
            >
              {diff.label}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {DIFFICULTIES.find(d => d.value === value)?.description}
      </p>
    </div>
  );
};

export default DifficultyPicker;
