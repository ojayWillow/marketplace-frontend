import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// Create a new QueryClient for each test to avoid shared state
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Don't retry failed queries in tests
        gcTime: 0, // Disable garbage collection time
        staleTime: 0, // Always consider data stale
      },
      mutations: {
        retry: false,
      },
    },
  });

interface WrapperProps {
  children: React.ReactNode;
}

// All providers wrapper for tests
const AllTheProviders = ({ children }: WrapperProps) => {
  const queryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Custom render that includes all providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };

// Utility to wait for async operations
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

// Mock data factories
export const createMockTask = (overrides = {}) => ({
  id: 1,
  title: 'Test Task',
  description: 'Test task description',
  category: 'cleaning',
  budget: 50,
  location: 'Riga, Latvia',
  latitude: 56.9496,
  longitude: 24.1052,
  status: 'open',
  creator_id: 1,
  creator_name: 'Test User',
  created_at: new Date().toISOString(),
  applications_count: 0,
  ...overrides,
});

export const createMockOffering = (overrides = {}) => ({
  id: 1,
  title: 'Test Offering',
  description: 'Test offering description',
  category: 'cleaning',
  price: 25,
  price_type: 'hourly' as const,
  location: 'Riga, Latvia',
  latitude: 56.9496,
  longitude: 24.1052,
  status: 'active',
  creator_id: 1,
  creator_name: 'Test Provider',
  creator_rating: 4.5,
  creator_review_count: 10,
  created_at: new Date().toISOString(),
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  avatar_url: null,
  created_at: new Date().toISOString(),
  ...overrides,
});

export const createMockConversation = (overrides = {}) => ({
  id: 1,
  other_participant: {
    id: 2,
    username: 'otheruser',
    first_name: 'Other',
    last_name: 'User',
    avatar_url: null,
    online_status: 'online',
  },
  last_message: {
    content: 'Hello!',
    created_at: new Date().toISOString(),
  },
  unread_count: 0,
  ...overrides,
});
