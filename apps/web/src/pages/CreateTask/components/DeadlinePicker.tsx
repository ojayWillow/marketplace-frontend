import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getTimeOptions } from '../types';

interface DeadlinePickerProps {
  deadlineDate: string;
  deadlineTime: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onTimeChange: (time: string) => void;
}

const TIME_SLOT_DEFS = [
  { key: 'morning', icon: '\u{1F305}', time: '10:00', hours: '8\u201312' },
  { key: 'afternoon', icon: '\u2600\uFE0F', time: '14:00', hours: '12\u201317' },
  { key: 'evening', icon: '\u{1F319}', time: '18:00', hours: '17\u201321' },
  { key: 'custom', icon: '\u{1F552}', time: '', hours: '' },
] as const;

const DeadlinePicker = ({ deadlineDate, deadlineTime, onChange, onTimeChange }: DeadlinePickerProps) => {
  const { t, i18n } = useTranslation();
  const today = new Date().toISOString().split('T')[0];
  const [showCustomTime, setShowCustomTime] = useState(false);

  const timeOptions = getTimeOptions(i18n.language);

  const activeSlot = (() => {
    if (!deadlineTime) return null;
    const slot = TIME_SLOT_DEFS.find(s => s.key !== 'custom' && s.time === deadlineTime);
    if (slot) return slot.key;
    return 'custom';
  })();

  const handleSlotClick = (slot: typeof TIME_SLOT_DEFS[number]) => {
    if (slot.key === 'custom') {
      setShowCustomTime(true);
    } else {
      setShowCustomTime(false);
      onTimeChange(slot.time);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {t('createTask.deadline', 'Deadline')} <span className="text-gray-400 dark:text-gray-500 font-normal text-xs">({t('common.optional', 'Optional')})</span>
      </label>

      <input
        type="date"
        id="deadlineDate"
        name="deadlineDate"
        value={deadlineDate}
        onChange={onChange}
        min={today}
        className="max-w-[220px] sm:max-w-none w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm mb-2"
      />

      {deadlineDate && (
        <>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">{t('createTask.preferredTime', 'Preferred time')}</p>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5">
            {TIME_SLOT_DEFS.map(slot => {
              const isActive = activeSlot === slot.key;
              const label = t(`createTask.timeSlot_${slot.key}`, slot.key);
              const desc = slot.key === 'custom'
                ? t('createTask.timeSlot_pickTime', 'Pick time')
                : slot.hours;
              return (
                <button
                  key={slot.key}
                  type="button"
                  onClick={() => handleSlotClick(slot)}
                  className={`px-2.5 py-1.5 rounded-lg border transition-all text-xs font-medium ${
                    isActive
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  {slot.icon} {label}
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-1">{desc}</span>
                </button>
              );
            })}
          </div>

          {showCustomTime && (
            <select
              id="deadlineTime"
              name="deadlineTime"
              value={deadlineTime}
              onChange={onChange}
              className="max-w-[220px] sm:max-w-none w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm mt-2"
            >
              <option value="">{t('createTask.anyTime', 'Select time')}</option>
              {timeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}
        </>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('createTask.deadlineHint', 'When do you need this task completed by?')}</p>
    </div>
  );
};

export default DeadlinePicker;
