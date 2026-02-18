import { useTranslation } from 'react-i18next';

interface DifficultyPickerProps {
  value: string;
  onChange: (difficulty: string) => void;
}

const DIFFICULTIES = [
  { value: 'easy', color: 'green', icon: '🟢' },
  { value: 'medium', color: 'amber', icon: '🟡' },
  { value: 'hard', color: 'red', icon: '🔴' },
] as const;

const DifficultyPicker = ({ value, onChange }: DifficultyPickerProps) => {
  const { t } = useTranslation();

  const colorMap: Record<string, { selected: string; hover: string }> = {
    green: { selected: 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 shadow-sm', hover: 'hover:border-green-300 dark:hover:border-green-600' },
    amber: { selected: 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 shadow-sm', hover: 'hover:border-amber-300 dark:hover:border-amber-600' },
    red: { selected: 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 shadow-sm', hover: 'hover:border-red-300 dark:hover:border-red-600' },
  };

  const labelKey: Record<string, string> = { easy: 'difficultyEasy', medium: 'difficultyMedium', hard: 'difficultyHard' };
  const descKey: Record<string, string> = { easy: 'difficultyEasyDesc', medium: 'difficultyMediumDesc', hard: 'difficultyHardDesc' };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                  : `border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 ${colors.hover}`
              }`}
            >
              {diff.icon} {t(`createTask.${labelKey[diff.value]}`, diff.value)}
            </button>
          );
        })}
      </div>
      {value && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t(`createTask.${descKey[value]}`, '')}
        </p>
      )}
    </div>
  );
};

export default DifficultyPicker;
