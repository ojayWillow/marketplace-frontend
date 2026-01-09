import { render, screen } from '../../../test/utils';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders without crashing', () => {
    render(<LoadingSpinner />);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('applies default medium size', () => {
    render(<LoadingSpinner />);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('w-8', 'h-8');
  });

  it('applies small size when specified', () => {
    render(<LoadingSpinner size="sm" />);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('w-4', 'h-4');
  });

  it('applies large size when specified', () => {
    render(<LoadingSpinner size="lg" />);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('w-12', 'h-12');
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="my-custom-class" />);
    const container = document.querySelector('.flex');
    expect(container).toHaveClass('my-custom-class');
  });

  it('combines size and custom className', () => {
    render(<LoadingSpinner size="lg" className="mt-4" />);
    const spinner = document.querySelector('.animate-spin');
    const container = document.querySelector('.flex');
    expect(spinner).toHaveClass('w-12', 'h-12');
    expect(container).toHaveClass('mt-4');
  });
});
