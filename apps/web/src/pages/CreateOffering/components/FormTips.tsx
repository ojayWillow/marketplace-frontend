import { useTranslation } from 'react-i18next';
import { getCategoryByValue } from '../../../constants/categories';

interface FormTipsProps {
  category: string;
}

const FormTips = ({ category }: FormTipsProps) => {
  const { t } = useTranslation();
  const selectedCategory = getCategoryByValue(category);

  return (
    <>
      {category && selectedCategory && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-lg p-3">
          <p className="text-xs text-amber-700 dark:text-amber-300">
            {selectedCategory.icon} {t('createOffering.matchingHint', 'People who post {{category}} jobs in your area will be able to find you and request your services!', { category: t(`tasks.categories.${selectedCategory.value}`, selectedCategory.label) })}
          </p>
        </div>
      )}
    </>
  );
};

export default FormTips;
