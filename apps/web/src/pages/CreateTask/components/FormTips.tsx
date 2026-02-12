import { useTranslation } from 'react-i18next';
import { getCategoryByValue } from '../../../constants/categories';

interface FormTipsProps {
  category: string;
}

const FormTips = ({ category }: FormTipsProps) => {
  const { t } = useTranslation();
  const selectedCategory = getCategoryByValue(category);

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-lg p-3">
      <h3 className="font-medium text-blue-800 dark:text-blue-300 text-sm mb-1">💡 {t('createTask.howItWorksTitle', 'How it works')}</h3>
      <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-0.5">
        <li>• {t('createTask.howItWorks1', 'Post your job and wait for applicants')}</li>
        <li>• {t('createTask.howItWorks2', 'Review profiles and pick a helper')}</li>
        <li>• {t('createTask.howItWorks3', 'Agree on details and get it done')}</li>
        <li>• {t('createTask.howItWorks4', "Pay when you're satisfied")}</li>
      </ul>
      {selectedCategory && (
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1.5">
          {selectedCategory.icon} {t('createTask.matchingHint', 'People offering {{category}} services in your area will see your job and can apply to help you!', { category: selectedCategory.label })}
        </p>
      )}
    </div>
  );
};

export default FormTips;
