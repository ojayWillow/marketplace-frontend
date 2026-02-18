import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DAYS_OF_WEEK, TIME_SLOTS } from '../types';

interface AvailabilityPickerProps {
  value: string;
  onChange: (availability: string) => void;
}

const AvailabilityPicker = ({ value, onChange }: AvailabilityPickerProps) => {
  const { t } = useTranslation();

  const DAY_LABELS: Record<string, string> = {
    mon: t('createOffering.dayMon', 'M'),
    tue: t('createOffering.dayTue', 'T'),
    wed: t('createOffering.dayWed', 'W'),
    thu: t('createOffering.dayThu', 'T'),
    fri: t('createOffering.dayFri', 'F'),
    sat: t('createOffering.daySat', 'S'),
    sun: t('createOffering.daySun', 'S'),
  };

  const DAY_FULL_NAMES: Record<string, string> = {
    mon: t('createOffering.dayMonFull', 'Mon'),
    tue: t('createOffering.dayTueFull', 'Tue'),
    wed: t('createOffering.dayWedFull', 'Wed'),
    thu: t('createOffering.dayThuFull', 'Thu'),
    fri: t('createOffering.dayFriFull', 'Fri'),
    sat: t('createOffering.daySatFull', 'Sat'),
    sun: t('createOffering.daySunFull', 'Sun'),
  };

  const timeSlotLabels: Record<string, string> = {
    morning: t('createOffering.timeMorning', 'Morning'),
    afternoon: t('createOffering.timeAfternoon', 'Afternoon'),
    evening: t('createOffering.timeEvening', 'Evening'),
    flexible: t('createOffering.timeFlexible', 'Flexible'),
  };

  const timeSlotDescs: Record<string, string> = {
    morning: '8\u201312',
    afternoon: '12\u201317',
    evening: '17\u201321',
    flexible: t('createOffering.timeAny', 'Any'),
  };

  const [selectedDays, setSelectedDays] = useState<string[]>(() => {
    const days = DAYS_OF_WEEK.map(d => d.key);
    return days.filter(d => value.toLowerCase().includes(DAY_FULL_NAMES[d]?.toLowerCase() || d));
  });
  const [selectedTimes, setSelectedTimes] = useState<string[]>(() => {
    const times = TIME_SLOTS.map(t => t.key);
    return times.filter(t => value.toLowerCase().includes(t));
  });
  const [customNote, setCustomNote] = useState('');

  const buildString = (days: string[], times: string[], note: string) => {
    const parts: string[] = [];
    if (days.length === 7) {
      parts.push(t('createOffering.everyDay', 'Every day'));
    } else if (days.length === 5 && !days.includes('sat') && !days.includes('sun')) {
      parts.push(t('createOffering.weekdays', 'Weekdays'));
    } else if (days.length === 2 && days.includes('sat') && days.includes('sun')) {
      parts.push(t('createOffering.weekends', 'Weekends'));
    } else if (days.length > 0) {
      parts.push(days.map(d => DAY_FULL_NAMES[d] || d).join(', '));
    }
    if (times.includes('flexible')) {
      parts.push(t('createOffering.flexibleHours', 'Flexible hours'));
    } else if (times.length > 0) {
      parts.push(times.filter(tk => tk !== 'flexible').map(tk => timeSlotLabels[tk] || tk).join(', '));
    }
    if (note.trim()) parts.push(note.trim());
    return parts.join(' \u2022 ');
  };

  const toggleDay = (day: string) => {
    const updated = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];
    setSelectedDays(updated);
    onChange(buildString(updated, selectedTimes, customNote));
  };

  const toggleTime = (time: string) => {
    let updated: string[];
    if (time === 'flexible') {
      updated = selectedTimes.includes('flexible') ? [] : ['flexible'];
    } else {
      updated = selectedTimes.includes(time)
        ? selectedTimes.filter(t => t !== time)
        : [...selectedTimes.filter(t => t !== 'flexible'), time];
    }
    setSelectedTimes(updated);
    onChange(buildString(selectedDays, updated, customNote));
  };

  const quickSelect = (type: 'weekdays' | 'weekends' | 'all') => {
    let days: string[];
    if (type === 'weekdays') days = ['mon', 'tue', 'wed', 'thu', 'fri'];
    else if (type === 'weekends') days = ['sat', 'sun'];
    else days = DAYS_OF_WEEK.map(d => d.key);

    const allSelected = days.every(d => selectedDays.includes(d));
    const updated = allSelected
      ? selectedDays.filter(d => !days.includes(d))
      : [...new Set([...selectedDays, ...days])];
    setSelectedDays(updated);
    onChange(buildString(updated, selectedTimes, customNote));
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomNote(e.target.value);
    onChange(buildString(selectedDays, selectedTimes, e.target.value));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {t('createOffering.availability', 'Availability')} <span className="text-gray-400 dark:text-gray-500 font-normal text-xs">({t('common.optional', 'Optional')})</span>
      </label>

      {/* Days row */}
      <div className="flex items-center gap-1 mb-2">
        {DAYS_OF_WEEK.map((day, i) => {
          const isSelected = selectedDays.includes(day.key);
          const isWeekend = i >= 5;
          return (
            <button
              key={day.key}
              type="button"
              onClick={() => toggleDay(day.key)}
              className={`w-8 h-8 rounded-full border text-[11px] font-bold transition-all flex items-center justify-center ${
                isSelected
                  ? 'border-amber-500 bg-amber-500 text-white'
                  : isWeekend
                    ? 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:border-gray-300 dark:hover:border-gray-500'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              {DAY_LABELS[day.key]}
            </button>
          );
        })}
        <div className="flex gap-1 ml-auto">
          <button type="button" onClick={() => quickSelect('weekdays')}
            className="text-[10px] text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-semibold px-1">{t('createOffering.wk', 'Wk')}</button>
          <button type="button" onClick={() => quickSelect('all')}
            className="text-[10px] text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-semibold px-1">{t('common.all', 'All')}</button>
        </div>
      </div>

      {/* Time slots */}
      <div className="flex gap-1.5 mb-2">
        {TIME_SLOTS.map(slot => {
          const isSelected = selectedTimes.includes(slot.key);
          return (
            <button
              key={slot.key}
              type="button"
              onClick={() => toggleTime(slot.key)}
              className={`flex-1 py-1.5 rounded-lg border text-center transition-all ${
                isSelected
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className={`text-[11px] font-semibold leading-tight ${isSelected ? 'text-amber-700 dark:text-amber-300' : 'text-gray-600 dark:text-gray-300'}`}>
                {timeSlotLabels[slot.key]}
              </div>
              <div className={`text-[9px] leading-tight ${isSelected ? 'text-amber-500 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500'}`}>
                {timeSlotDescs[slot.key]}
              </div>
            </button>
          );
        })}
      </div>

      <input
        type="text"
        value={customNote}
        onChange={handleNoteChange}
        placeholder={t('createOffering.availabilityPlaceholder', "Notes (e.g., 'Not on holidays')")}
        className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />

      {value && (
        <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1.5 font-medium">
          \uD83D\uDCC5 {value}
        </p>
      )}
    </div>
  );
};

export default AvailabilityPicker;
