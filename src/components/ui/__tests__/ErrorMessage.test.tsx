import { render, screen } from '../../../test/utils';
import ErrorMessage from '../ErrorMessage';

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key === 'common.error' ? 'An error occurred' : key,
    i18n: { changeLanguage: jest.fn() },
  }),
}));

describe('ErrorMessage', () => {
  it('renders the provided error message', () => {
    render(<ErrorMessage message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders default message when no message provided', () => {
    render(<ErrorMessage />);
    expect(screen.getByText('An error occurred')).toBeInTheDocument();
  });

  it('renders with correct styling', () => {
    const { container } = render(<ErrorMessage message="Error" />);
    expect(container.firstChild).toHaveClass('bg-red-50', 'border-red-200');
  });

  it('applies custom className', () => {
    const { container } = render(
      <ErrorMessage message="Error" className="my-custom-class" />
    );
    expect(container.firstChild).toHaveClass('my-custom-class');
  });

  it('renders error icon', () => {
    const { container } = render(<ErrorMessage message="Error" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('text-red-500');
  });

  it('renders message in correct styled span', () => {
    render(<ErrorMessage message="Test error" />);
    const messageSpan = screen.getByText('Test error');
    expect(messageSpan).toHaveClass('text-red-700', 'text-sm', 'font-medium');
  });
});
