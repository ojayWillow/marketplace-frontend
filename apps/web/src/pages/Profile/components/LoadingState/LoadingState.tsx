interface LoadingStateProps {
  message?: string;
}

export const LoadingState = ({ message = 'Loading profile...' }: LoadingStateProps) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

export const ErrorState = ({ message = 'Failed to load profile' }: { message?: string }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-xl text-red-600">{message}</div>
  </div>
);

export const TabLoadingSpinner = ({ color = 'blue' }: { color?: string }) => (
  <div className="text-center py-8">
    <div className={`w-8 h-8 border-3 border-${color}-500 border-t-transparent rounded-full animate-spin mx-auto`}></div>
  </div>
);
