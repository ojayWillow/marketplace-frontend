import { act } from '@testing-library/react';
import { useAuthStore } from '../authStore';

// Reset store before each test
beforeEach(() => {
  // Clear the store state
  useAuthStore.setState({
    user: null,
    token: null,
    isAuthenticated: false,
  });
  
  // Clear localStorage
  localStorage.clear();
});

describe('authStore', () => {
  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    avatar_url: null,
    created_at: '2024-01-01T00:00:00Z',
  };
  const mockToken = 'test-jwt-token-12345';

  describe('initial state', () => {
    it('should have null user initially', () => {
      const { user } = useAuthStore.getState();
      expect(user).toBeNull();
    });

    it('should have null token initially', () => {
      const { token } = useAuthStore.getState();
      expect(token).toBeNull();
    });

    it('should not be authenticated initially', () => {
      const { isAuthenticated } = useAuthStore.getState();
      expect(isAuthenticated).toBe(false);
    });
  });

  describe('setAuth', () => {
    it('should set user when setAuth is called', () => {
      const { setAuth } = useAuthStore.getState();
      
      act(() => {
        setAuth(mockUser, mockToken);
      });

      const { user } = useAuthStore.getState();
      expect(user).toEqual(mockUser);
    });

    it('should set token when setAuth is called', () => {
      const { setAuth } = useAuthStore.getState();
      
      act(() => {
        setAuth(mockUser, mockToken);
      });

      const { token } = useAuthStore.getState();
      expect(token).toBe(mockToken);
    });

    it('should set isAuthenticated to true when setAuth is called', () => {
      const { setAuth } = useAuthStore.getState();
      
      act(() => {
        setAuth(mockUser, mockToken);
      });

      const { isAuthenticated } = useAuthStore.getState();
      expect(isAuthenticated).toBe(true);
    });
  });

  describe('logout', () => {
    it('should clear user on logout', () => {
      const { setAuth, logout } = useAuthStore.getState();
      
      act(() => {
        setAuth(mockUser, mockToken);
      });
      
      act(() => {
        logout();
      });

      const { user } = useAuthStore.getState();
      expect(user).toBeNull();
    });

    it('should clear token on logout', () => {
      const { setAuth, logout } = useAuthStore.getState();
      
      act(() => {
        setAuth(mockUser, mockToken);
      });
      
      act(() => {
        logout();
      });

      const { token } = useAuthStore.getState();
      expect(token).toBeNull();
    });

    it('should set isAuthenticated to false on logout', () => {
      const { setAuth, logout } = useAuthStore.getState();
      
      act(() => {
        setAuth(mockUser, mockToken);
      });
      
      act(() => {
        logout();
      });

      const { isAuthenticated } = useAuthStore.getState();
      expect(isAuthenticated).toBe(false);
    });
  });

  describe('persistence', () => {
    it('should have persist configuration', () => {
      // The store should be configured with persist middleware
      // We can verify this by checking the store has persist methods
      expect(useAuthStore.persist).toBeDefined();
    });
  });
});
