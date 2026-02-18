import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface DesktopApplicationFormProps {
  onSubmit: (message: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const DesktopApplicationForm = ({
  onSubmit,
  onCancel,
  isSubmitting,
}: DesktopApplicationFormProps) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');

  return (
    <div className="hidden md:block mx-6 mb-5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-xl p-4">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base mb-3">
        {t('taskDetail.applyForJob')}
      </h3>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={t('taskDetail.applyPlaceholder')}
        className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] text-sm mb-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
      />
      <div className="flex gap-2">
        <button
          onClick={() => onSubmit(message)}
          disabled={isSubmitting}
          className="flex-1 bg-blue-500 text-white py-2.5 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-semibold text-sm"
        >
          {isSubmitting ? t('taskDetail.submitting') : t('taskDetail.submitApplication')}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium text-sm"
        >
          {t('taskDetail.cancel')}
        </button>
      </div>
    </div>
  );
};
