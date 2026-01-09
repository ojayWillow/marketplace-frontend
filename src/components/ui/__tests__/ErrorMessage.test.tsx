import { render, screen } from '../../../test/utils';
import ErrorMessage from '../ErrorMessage';

describe('ErrorMessage', () => {
  it('renders the error message', () => {
    render(<ErrorMessage message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders with default styling', () => {
    const { container } = render(<ErrorMessage message="Error" />);
    expect(container.firstChild).toHaveClass('text-red-600');
  });

  it('applies custom className', () => {
    const { container } = render(
      <ErrorMessage message="Error" className="my-custom-class" />
    );
    expect(container.firstChild).toHaveClass('my-custom-class');
  });

  it('renders with icon', () => {
    const { container } = render(<ErrorMessage message="Error" />);
    // Check for the error icon (SVG)
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
