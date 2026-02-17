export default function MessagesSkeleton() {
  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-950 animate-page-enter">
      <div
        className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-5 pb-3 pt-4"
        style={{ paddingTop: 'max(16px, env(safe-area-inset-top, 0px))' }}
      >
        <div className="h-7 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
      <div className="flex-1 px-4 space-y-3 pt-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 animate-pulse"
          >
            <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1">
              <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-3 w-40 bg-gray-100 dark:bg-gray-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
