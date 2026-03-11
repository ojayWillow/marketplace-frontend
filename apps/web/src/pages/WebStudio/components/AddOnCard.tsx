import type { AddOn } from '../../../constants/webPackages';

interface Props {
  addon: AddOn;
}

export default function AddOnCard({ addon }: Props) {
  return (
    <div className="flex items-start gap-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
      <span className="text-3xl flex-shrink-0">{addon.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{addon.title}</h3>
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">{addon.price}</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{addon.description}</p>
      </div>
    </div>
  );
}
