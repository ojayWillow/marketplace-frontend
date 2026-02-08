import { useTranslation } from 'react-i18next';

interface UrgentToggleProps {
  value: boolean;
  onChange: (urgent: boolean) => void;
}

const UrgentToggle = ({ value, onChange }: UrgentToggleProps) => {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm font-medium w-full ${
        value
          ? 'border-red-400 bg-red-50 text-red-700'
          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
      }`}
    >
      <span className="text-base">{value ? '🚨' : '⏳'}</span>
      <span>{t('createTask.urgent', 'This is an urgent task')}</span>
      <span className={`ml-auto w-8 h-5 rounded-full transition-colors flex items-center ${
        value ? 'bg-red-400 justify-end' : 'bg-gray-300 justify-start'
      }`}>
        <span className="w-4 h-4 bg-white rounded-full shadow mx-0.5" />
      </span>
    </button>
  );
};

export default UrgentToggle;
