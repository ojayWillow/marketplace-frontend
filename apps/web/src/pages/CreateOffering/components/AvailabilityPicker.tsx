import { useState } from 'react';
import { DAYS_OF_WEEK, TIME_SLOTS } from '../types';

interface AvailabilityPickerProps {
  value: string;
  onChange: (availability: string) => void;
}

const DAY_FULL_NAMES: Record<string, string> = {
  mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
};

const AvailabilityPicker = ({ value, onChange }: AvailabilityPickerProps) => {
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
      parts.push('Every day');
    } else if (days.length === 5 && !days.includes('sat') && !days.includes('sun')) {
      parts.push('Weekdays');
    } else if (days.length === 2 && days.includes('sat') && days.includes('sun')) {
      parts.push('Weekends');
    } else if (days.length > 0) {
      parts.push(days.map(d => DAY_FULL_NAMES[d] || d).join(', '));
    }
    if (times.includes('flexible')) {
      parts.push('Flexible hours');
    } else if (times.length > 0) {
      parts.push(TIME_SLOTS.filter(t => times.includes(t.key) && t.key !== 'flexible').map(t => t.label).join(', '));
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
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Availability <span className="text-gray-400 font-normal text-xs">(Optional)</span>
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
                    ? 'border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
              }`}
            >
              {day.label}
            </button>
          );
        })}
        <div className="flex gap-1 ml-auto">
          <button type="button" onClick={() => quickSelect('weekdays')}
            className="text-[10px] text-amber-600 hover:text-amber-700 font-semibold px-1">Wk</button>
          <button type="button" onClick={() => quickSelect('all')}
            className="text-[10px] text-amber-600 hover:text-amber-700 font-semibold px-1">All</button>
        </div>
      </div>

      {/* Time slots - single row */}
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
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className={`text-[11px] font-semibold leading-tight ${isSelected ? 'text-amber-700' : 'text-gray-600'}`}>
                {slot.label}
              </div>
              <div className={`text-[9px] leading-tight ${isSelected ? 'text-amber-500' : 'text-gray-400'}`}>
                {slot.desc}
              </div>
            </button>
          );
        })}
      </div>

      {/* Optional note */}
      <input
        type="text"
        value={customNote}
        onChange={handleNoteChange}
        placeholder="Notes (e.g., 'Not on holidays')"
        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:border-transparent"
      />

      {/* Preview */}
      {value && (
        <p className="text-[11px] text-amber-600 mt-1.5 font-medium">
          📅 {value}
        </p>
      )}
    </div>
  );
};

export default AvailabilityPicker;
