import { useTranslation } from 'react-i18next';
import { TIME_OPTIONS } from '../types';

interface DeadlinePickerProps {
  deadlineDate: string;
  deadlineTime: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const DeadlinePicker = ({ deadlineDate, deadlineTime, onChange }: DeadlinePickerProps) => {
  const { t } = useTranslation();
  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {t('createTask.deadline', 'Deadline')} <span className="text-gray-400 font-normal text-xs">({t('common.optional', 'Optional')})</span>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="deadlineDate" className="block text-xs text-gray-500 mb-0.5">{t('createTask.date', 'Date')}</label>
          <input
            type="date"
            id="deadlineDate"
            name="deadlineDate"
            value={deadlineDate}
            onChange={onChange}
            min={today}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
        <div>
          <label htmlFor="deadlineTime" className="block text-xs text-gray-500 mb-0.5">{t('createTask.time', 'Time')}</label>
          <select
            id="deadlineTime"
            name="deadlineTime"
            value={deadlineTime}
            onChange={onChange}
            disabled={!deadlineDate}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">{t('createTask.anyTime', 'Any time')}</option>
            {TIME_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-1">{t('createTask.deadlineHint', 'When do you need this task completed by?')}</p>
    </div>
  );
};

export default DeadlinePicker;
