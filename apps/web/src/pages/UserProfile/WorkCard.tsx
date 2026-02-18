import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCategoryIcon } from '../../constants/categories';

interface WorkCardProps {
  id: number;
  type: 'offering' | 'task' | 'listing';
  title: string;
  description?: string;
  price?: number;
  category?: string;
  image?: string;
}

const routePrefix = { offering: '/offerings', task: '/tasks', listing: '/listings' } as const;

export default function WorkCard({ id, type, title, description, price, category, image }: WorkCardProps) {
  const { t } = useTranslation();

  const badgeConfig = {
    offering: { label: t('userProfile.badgeOffering', 'Offering'), text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    task:     { label: t('userProfile.badgeTask', 'Task'),         text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    listing:  { label: t('userProfile.badgeListing', 'Listing'),   text: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  } as const;

  const badge = badgeConfig[type];

  const icon = type === 'listing' && image ? (
    <img src={image} alt="" className="w-full h-full object-cover" />
  ) : type === 'listing' ? (
    <div className="w-full h-full flex items-center justify-center text-lg">📋</div>
  ) : (
    <>{getCategoryIcon(category || '')}</>
  );

  return (
    <Link
      to={`${routePrefix[type]}/${id}`}
      className="block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all"
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${type === 'listing' ? 'bg-gray-100 dark:bg-gray-800 overflow-hidden' : 'bg-gray-50 dark:bg-gray-800'}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">{title}</p>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{description}</p>
          )}
          {price != null && price > 0 && (
            <p className="text-sm font-bold text-green-600 dark:text-green-400 mt-1">€{price}</p>
          )}
        </div>
        <span className={`text-[10px] font-medium ${badge.text} ${badge.bg} px-2 py-0.5 rounded-full flex-shrink-0`}>
          {badge.label}
        </span>
      </div>
    </Link>
  );
}
