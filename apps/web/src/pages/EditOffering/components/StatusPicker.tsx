import { useTranslation } from 'react-i18next';
import { STATUS_OPTIONS } from '../types';

interface StatusPickerProps {
  value: string;
  onChange: (status: string) => void;
}

const StatusPicker = ({ value, onChange }: StatusPickerProps) => {
  const { t } = useTranslation();

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {t('editOffering.status', 'Status')}
      </label>
      <div className="flex gap-3">
        {STATUS_OPTIONS.map(option => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
              value === option.value
                ? option.value === 'active'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : 'border-gray-400 dark:border-gray-500 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400'
            }`}
          >
            <div className="font-medium">{t(option.labelKey, option.labelDefault)}</div>
            <div className="text-xs opacity-75">{option.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StatusPicker;
