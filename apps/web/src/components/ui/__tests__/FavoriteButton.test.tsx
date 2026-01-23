import { render, screen, fireEvent, waitFor } from '../../../test/utils';
import FavoriteButton from '../FavoriteButton';
import { useAuthStore } from '@marketplace/shared';
import * as favoritesHooks from '../../../hooks/useFavorites';
import * as favoritesApi from '@marketplace/shared';

// Mock the favorites hooks and API
jest.mock('../../../hooks/useFavorites', () => ({
  useToggleFavorite: jest.fn(),
}));

jest.mock('../../../api/favorites', () => ({
  checkFavorites: jest.fn(),
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Reset stores before each test
beforeEach(() => {
  useAuthStore.setState({
    user: null,
    token: null,
    isAuthenticated: false,
  });
  jest.clearAllMocks();
  
  // Default mock implementations
  (favoritesHooks.useToggleFavorite as jest.Mock).mockReturnValue({
    mutateAsync: jest.fn(),
    isPending: false,
  });
  (favoritesApi.checkFavorites as jest.Mock).mockResolvedValue({
    favorites: {},
  });
});

describe('FavoriteButton', () => {
  const defaultProps = {
    itemId: 1,
    itemType: 'task' as const,
  };

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    avatar_url: null,
    created_at: '2024-01-01T00:00:00Z',
  };

  describe('when user is not authenticated', () => {
    it('should render the button', () => {
      render(<FavoriteButton {...defaultProps} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should show unfilled heart when not favorited', () => {
      render(<FavoriteButton {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('should redirect to login when clicked', async () => {
      render(<FavoriteButton {...defaultProps} />);
      
      fireEvent.click(screen.getByRole('button'));
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('when user is authenticated', () => {
    beforeEach(() => {
      useAuthStore.setState({
        user: mockUser,
        token: 'test-token',
        isAuthenticated: true,
      });
    });

    it('should show filled heart when initialFavorited is true', () => {
      render(<FavoriteButton {...defaultProps} initialFavorited={true} />);
      const button = screen.getByRole('button');
      // Should have red background class when favorited
      expect(button).toHaveClass('bg-red-100');
    });

    it('should call toggleFavorite when clicking', async () => {
      const toggleMock = jest.fn().mockResolvedValue({
        is_favorited: true,
        message: 'Added to favorites',
      });
      
      (favoritesHooks.useToggleFavorite as jest.Mock).mockReturnValue({
        mutateAsync: toggleMock,
        isPending: false,
      });

      render(<FavoriteButton {...defaultProps} initialFavorited={false} />);
      
      fireEvent.click(screen.getByRole('button'));
      
      await waitFor(() => {
        expect(toggleMock).toHaveBeenCalledWith({
          itemType: 'task',
          itemId: 1,
        });
      });
    });
  });

  describe('loading state', () => {
    it('should show loading spinner when toggling', async () => {
      useAuthStore.setState({
        user: mockUser,
        token: 'test-token',
        isAuthenticated: true,
      });

      // Mock that takes time to resolve
      const toggleMock = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          is_favorited: true,
          message: 'Added',
        }), 100))
      );
      
      (favoritesHooks.useToggleFavorite as jest.Mock).mockReturnValue({
        mutateAsync: toggleMock,
        isPending: false,
      });

      render(<FavoriteButton {...defaultProps} initialFavorited={false} />);
      
      fireEvent.click(screen.getByRole('button'));
      
      // Should show loading state
      const button = screen.getByRole('button');
      expect(button).toHaveClass('opacity-50');
    });
  });

  describe('size variants', () => {
    it('should render small size', () => {
      render(<FavoriteButton {...defaultProps} size="sm" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-6', 'h-6');
    });

    it('should render medium size by default', () => {
      render(<FavoriteButton {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-8', 'h-8');
    });

    it('should render large size', () => {
      render(<FavoriteButton {...defaultProps} size="lg" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-10', 'h-10');
    });
  });

  describe('showText prop', () => {
    it('should show "Save" text when showText is true and not favorited', () => {
      render(<FavoriteButton {...defaultProps} showText={true} initialFavorited={false} />);
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('should show "Saved" text when showText is true and favorited', () => {
      render(<FavoriteButton {...defaultProps} showText={true} initialFavorited={true} />);
      expect(screen.getByText('Saved')).toBeInTheDocument();
    });

    it('should not show text by default', () => {
      render(<FavoriteButton {...defaultProps} initialFavorited={false} />);
      expect(screen.queryByText('Save')).not.toBeInTheDocument();
      expect(screen.queryByText('Saved')).not.toBeInTheDocument();
    });
  });
});
