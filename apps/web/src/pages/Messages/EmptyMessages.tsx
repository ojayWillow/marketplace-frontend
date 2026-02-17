import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface EmptyMessagesProps {
  variant: 'mobile' | 'desktop';
}

export default function EmptyMessages({ variant }: EmptyMessagesProps) {
  const { t } = useTranslation();

  if (variant === 'mobile') {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center mb-5">
          <span className="text-5xl">💬</span>
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
          {t('messages.noConversations', 'No conversations yet')}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-[240px]">
          {t('messages.startConversation', 'Apply to a job or contact someone to start chatting')}
        </p>
        <Link
          to="/"
          className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-200 dark:shadow-blue-900/30"
        >
          {t('messages.browseTasks', 'Browse Map')}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 p-8 text-center">
      <div className="text-6xl mb-4">📭</div>
      <p className="text-gray-500 dark:text-gray-400 mb-4">
        {t('messages.noConversations', 'No conversations yet')}
      </p>
      <Link
        to="/"
        className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
      >
        {t('messages.browseTasks', 'Browse Map')}
      </Link>
    </div>
  );
}
