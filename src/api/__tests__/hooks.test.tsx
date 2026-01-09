import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTask, useOffering } from '../hooks';
import * as tasksApi from '../tasks';
import * as offeringsApi from '../offerings';

// Mock the API modules
jest.mock('../tasks');
jest.mock('../offerings');

// Create wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('API Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useTask', () => {
    const mockTask = {
      id: 1,
      title: 'Test Task',
      description: 'Test description',
      category: 'cleaning',
      budget: 50,
      location: 'Riga',
      status: 'open',
      creator_id: 1,
      created_at: '2024-01-01T00:00:00Z',
    };

    it('should fetch task data successfully', async () => {
      (tasksApi.getTask as jest.Mock).mockResolvedValue(mockTask);

      const { result } = renderHook(() => useTask(1), {
        wrapper: createWrapper(),
      });

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockTask);
      expect(tasksApi.getTask).toHaveBeenCalledWith(1);
    });

    it('should handle error when fetching task', async () => {
      const error = new Error('Task not found');
      (tasksApi.getTask as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useTask(999), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should not fetch when taskId is undefined', async () => {
      const { result } = renderHook(() => useTask(undefined as any), {
        wrapper: createWrapper(),
      });

      // Should not be loading since query is disabled
      expect(result.current.isLoading).toBe(false);
      expect(result.current.fetchStatus).toBe('idle');
      expect(tasksApi.getTask).not.toHaveBeenCalled();
    });
  });

  describe('useOffering', () => {
    const mockOffering = {
      id: 1,
      title: 'Test Offering',
      description: 'Test description',
      category: 'cleaning',
      price: 25,
      price_type: 'hourly',
      location: 'Riga',
      status: 'active',
      creator_id: 1,
      created_at: '2024-01-01T00:00:00Z',
    };

    it('should fetch offering data successfully', async () => {
      (offeringsApi.getOffering as jest.Mock).mockResolvedValue(mockOffering);

      const { result } = renderHook(() => useOffering(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockOffering);
      expect(offeringsApi.getOffering).toHaveBeenCalledWith(1);
    });

    it('should handle error when fetching offering', async () => {
      const error = new Error('Offering not found');
      (offeringsApi.getOffering as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useOffering(999), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });
});
