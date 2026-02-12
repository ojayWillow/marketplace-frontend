import { useTranslation } from 'react-i18next';

interface BudgetInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BudgetInput = ({ value, onChange }: BudgetInputProps) => {
  const { t } = useTranslation();

  return (
    <div>
      <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {t('createTask.budget', 'Budget (EUR)')} *
      </label>
      <input
        type="number"
        id="budget"
        name="budget"
        step="0.01"
        min="0"
        required
        value={value}
        onChange={onChange}
        placeholder={t('createTask.budgetPlaceholder', 'e.g., 25.00')}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('createTask.budgetHint', 'How much are you willing to pay for this task?')}</p>
    </div>
  );
};

export default BudgetInput;
