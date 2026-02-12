interface LoadingStateProps {
  onBack: () => void;
}

export const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
      <p className="text-gray-600 dark:text-gray-400">Loading task...</p>
    </div>
  </div>
);

export const NotFoundState = ({ onBack }: LoadingStateProps) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Task not found</h2>
      <button
        onClick={onBack}
        className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
      >
        Back to Tasks
      </button>
    </div>
  </div>
);
