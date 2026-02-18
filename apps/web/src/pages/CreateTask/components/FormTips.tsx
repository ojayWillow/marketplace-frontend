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
      {selectedCategory && (
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1.5">
          {selectedCategory.icon} {t('createTask.matchingHint', 'People offering {{category}} services in your area will see your job and can apply to help you!', { category: t(`tasks.categories.${selectedCategory.value}`, selectedCategory.label) })}
        </p>
      )}
    </div>
  );
};

export default FormTips;
