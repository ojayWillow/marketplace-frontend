import { useState } from 'react';
import { DAYS_OF_WEEK, TIME_SLOTS } from '../types';

interface AvailabilityPickerProps {
  value: string;
  onChange: (availability: string) => void;
}

const AvailabilityPicker = ({ value, onChange }: AvailabilityPickerProps) => {
  // Parse existing value or start fresh
  const [selectedDays, setSelectedDays] = useState<string[]>(() => {
    const days = DAYS_OF_WEEK.map(d => d.key);
    return days.filter(d => value.toLowerCase().includes(d));
  });
  const [selectedTimes, setSelectedTimes] = useState<string[]>(() => {
    const times = TIME_SLOTS.map(t => t.key);
    return times.filter(t => value.toLowerCase().includes(t));
  });
  const [customNote, setCustomNote] = useState('');

  const buildAvailabilityString = (days: string[], times: string[], note: string) => {
    const parts: string[] = [];

    if (days.length === 7) {
      parts.push('Every day');
    } else if (days.length === 5 && !days.includes('sat') && !days.includes('sun')) {
      parts.push('Weekdays');
    } else if (days.length === 2 && days.includes('sat') && days.includes('sun')) {
      parts.push('Weekends');
    } else if (days.length > 0) {
      const dayLabels = DAYS_OF_WEEK.filter(d => days.includes(d.key)).map(d => d.label);
      parts.push(dayLabels.join(', '));
    }

    if (times.includes('flexible')) {
      parts.push('Flexible hours');
    } else if (times.length > 0) {
      const timeLabels = TIME_SLOTS.filter(t => times.includes(t.key) && t.key !== 'flexible').map(t => t.label);
      parts.push(timeLabels.join(', '));
    }

    if (note.trim()) {
      parts.push(note.trim());
    }

    return parts.join(' • ');
  };

  const toggleDay = (day: string) => {
    const updated = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];
    setSelectedDays(updated);
    onChange(buildAvailabilityString(updated, selectedTimes, customNote));
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
    onChange(buildAvailabilityString(selectedDays, updated, customNote));
  };

  const selectAllWeekdays = () => {
    const weekdays = ['mon', 'tue', 'wed', 'thu', 'fri'];
    const allSelected = weekdays.every(d => selectedDays.includes(d));
    const updated = allSelected
      ? selectedDays.filter(d => !weekdays.includes(d))
      : [...new Set([...selectedDays, ...weekdays])];
    setSelectedDays(updated);
    onChange(buildAvailabilityString(updated, selectedTimes, customNote));
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomNote(e.target.value);
    onChange(buildAvailabilityString(selectedDays, selectedTimes, e.target.value));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        When are you available? <span className="text-gray-400 font-normal">(Optional)</span>
      </label>

      {/* Days */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Days</p>
          <button
            type="button"
            onClick={selectAllWeekdays}
            className="text-xs text-amber-600 hover:text-amber-700 font-medium"
          >
            {['mon', 'tue', 'wed', 'thu', 'fri'].every(d => selectedDays.includes(d)) ? 'Clear weekdays' : 'Select weekdays'}
          </button>
        </div>
        <div className="flex gap-1.5">
          {DAYS_OF_WEEK.map(day => {
            const isSelected = selectedDays.includes(day.key);
            return (
              <button
                key={day.key}
                type="button"
                onClick={() => toggleDay(day.key)}
                className={`flex-1 py-2 rounded-lg border-2 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      <div className="mb-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Time of day</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TIME_SLOTS.map(slot => {
            const isSelected = selectedTimes.includes(slot.key);
            return (
              <button
                key={slot.key}
                type="button"
                onClick={() => toggleTime(slot.key)}
                className={`py-2 px-3 rounded-xl border-2 transition-all text-center ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className={`text-sm font-medium ${isSelected ? 'text-amber-700' : 'text-gray-700'}`}>
                  {slot.label}
                </div>
                <div className={`text-xs ${isSelected ? 'text-amber-500' : 'text-gray-400'}`}>
                  {slot.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional note */}
      <input
        type="text"
        value={customNote}
        onChange={handleNoteChange}
        placeholder="Any additional notes (e.g., 'Not available on holidays')"
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
      />

      {/* Preview */}
      {value && (
        <div className="mt-2 px-3 py-2 bg-amber-50 rounded-lg">
          <p className="text-xs text-amber-700">
            📅 <span className="font-medium">Preview:</span> {value}
          </p>
        </div>
      )}
    </div>
  );
};

export default AvailabilityPicker;
