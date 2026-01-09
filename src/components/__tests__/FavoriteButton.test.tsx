import { render, screen, fireEvent, waitFor } from '../../test/utils';
import FavoriteButton from '../FavoriteButton';
import { useAuthStore } from '../../stores/authStore';
import * as favoritesHooks from '../../hooks/useFavorites';

// Mock the favorites hooks
jest.mock('../../hooks/useFavorites', () => ({
  useCheckFavorite: jest.fn(),
  useAddFavorite: jest.fn(),
  useRemoveFavoriteByItem: jest.fn(),
}));

// Reset auth store before each test
beforeEach(() => {
  useAuthStore.setState({
    user: null,
    token: null,
    isAuthenticated: false,
  });
  jest.clearAllMocks();
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
    beforeEach(() => {
      (favoritesHooks.useCheckFavorite as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
      });
      (favoritesHooks.useAddFavorite as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
        isPending: false,
      });
      (favoritesHooks.useRemoveFavoriteByItem as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
        isPending: false,
      });
    });

    it('should render the button', () => {
      render(<FavoriteButton {...defaultProps} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should show unfilled heart when not favorited', () => {
      render(<FavoriteButton {...defaultProps} />);
      const button = screen.getByRole('button');
      // Button should not have the "text-red-500" class when not favorited
      expect(button.querySelector('svg')).toBeInTheDocument();
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

    it('should show filled heart when item is favorited', () => {
      (favoritesHooks.useCheckFavorite as jest.Mock).mockReturnValue({
        data: { is_favorited: true },
        isLoading: false,
      });
      (favoritesHooks.useAddFavorite as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
        isPending: false,
      });
      (favoritesHooks.useRemoveFavoriteByItem as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
        isPending: false,
      });

      render(<FavoriteButton {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-red-500');
    });

    it('should call addFavorite when clicking unfavorited item', async () => {
      const addFavoriteMock = jest.fn().mockResolvedValue({});
      
      (favoritesHooks.useCheckFavorite as jest.Mock).mockReturnValue({
        data: { is_favorited: false },
        isLoading: false,
      });
      (favoritesHooks.useAddFavorite as jest.Mock).mockReturnValue({
        mutateAsync: addFavoriteMock,
        isPending: false,
      });
      (favoritesHooks.useRemoveFavoriteByItem as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
        isPending: false,
      });

      render(<FavoriteButton {...defaultProps} />);
      
      fireEvent.click(screen.getByRole('button'));
      
      await waitFor(() => {
        expect(addFavoriteMock).toHaveBeenCalledWith({
          itemId: 1,
          itemType: 'task',
        });
      });
    });

    it('should call removeFavorite when clicking favorited item', async () => {
      const removeFavoriteMock = jest.fn().mockResolvedValue({});
      
      (favoritesHooks.useCheckFavorite as jest.Mock).mockReturnValue({
        data: { is_favorited: true },
        isLoading: false,
      });
      (favoritesHooks.useAddFavorite as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
        isPending: false,
      });
      (favoritesHooks.useRemoveFavoriteByItem as jest.Mock).mockReturnValue({
        mutateAsync: removeFavoriteMock,
        isPending: false,
      });

      render(<FavoriteButton {...defaultProps} />);
      
      fireEvent.click(screen.getByRole('button'));
      
      await waitFor(() => {
        expect(removeFavoriteMock).toHaveBeenCalledWith({
          itemId: 1,
          itemType: 'task',
        });
      });
    });
  });

  describe('loading state', () => {
    it('should be disabled while loading check', () => {
      (favoritesHooks.useCheckFavorite as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: true,
      });
      (favoritesHooks.useAddFavorite as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
        isPending: false,
      });
      (favoritesHooks.useRemoveFavoriteByItem as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
        isPending: false,
      });

      render(<FavoriteButton {...defaultProps} />);
      
      // The button should have reduced opacity while loading
      const button = screen.getByRole('button');
      expect(button).toHaveClass('opacity-50');
    });
  });

  describe('size variants', () => {
    beforeEach(() => {
      (favoritesHooks.useCheckFavorite as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
      });
      (favoritesHooks.useAddFavorite as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
        isPending: false,
      });
      (favoritesHooks.useRemoveFavoriteByItem as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
        isPending: false,
      });
    });

    it('should render small size', () => {
      render(<FavoriteButton {...defaultProps} size="sm" />);
      const svg = screen.getByRole('button').querySelector('svg');
      expect(svg).toHaveClass('w-4', 'h-4');
    });

    it('should render medium size by default', () => {
      render(<FavoriteButton {...defaultProps} />);
      const svg = screen.getByRole('button').querySelector('svg');
      expect(svg).toHaveClass('w-5', 'h-5');
    });

    it('should render large size', () => {
      render(<FavoriteButton {...defaultProps} size="lg" />);
      const svg = screen.getByRole('button').querySelector('svg');
      expect(svg).toHaveClass('w-6', 'h-6');
    });
  });
});
