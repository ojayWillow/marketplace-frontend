import { render, screen } from '../../../test/utils';
import Alert from '../Alert';

describe('Alert', () => {
  it('renders children correctly', () => {
    render(<Alert>Test message</Alert>);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('applies default type (info)', () => {
    const { container } = render(<Alert>Info message</Alert>);
    // Default type should be info (blue styling)
    expect(container.firstChild).toHaveClass('bg-blue-50');
  });

  it('applies error type styling', () => {
    const { container } = render(<Alert type="error">Error message</Alert>);
    expect(container.firstChild).toHaveClass('bg-red-50');
  });

  it('applies success type styling', () => {
    const { container } = render(<Alert type="success">Success message</Alert>);
    expect(container.firstChild).toHaveClass('bg-green-50');
  });

  it('applies warning type styling', () => {
    const { container } = render(<Alert type="warning">Warning message</Alert>);
    expect(container.firstChild).toHaveClass('bg-yellow-50');
  });

  it('applies custom className', () => {
    const { container } = render(
      <Alert className="my-custom-class">Custom alert</Alert>
    );
    expect(container.firstChild).toHaveClass('my-custom-class');
  });
});
