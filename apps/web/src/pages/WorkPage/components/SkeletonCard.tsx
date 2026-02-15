const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-900 rounded-xl p-3 shadow-sm dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-800 border-l-4 border-l-gray-200 dark:border-l-gray-700 animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-1.5">
        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="w-16 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="w-12 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
    <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
    <div className="flex gap-2 mb-3">
      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
      <div className="flex flex-col justify-center gap-1 flex-1">
        <div className="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="w-32 h-3 bg-gray-100 dark:bg-gray-800 rounded" />
      </div>
    </div>
    <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded mb-1" />
    <div className="w-2/3 h-3 bg-gray-100 dark:bg-gray-800 rounded mb-3" />
    <div className="flex items-center justify-between">
      <div className="w-14 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="w-14 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="w-14 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  </div>
);

export default SkeletonCard;
