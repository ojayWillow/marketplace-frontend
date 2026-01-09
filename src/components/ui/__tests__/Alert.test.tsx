import React from 'react';
import { render, screen } from '@testing-library/react';
import Alert from '../Alert';

describe('Alert', () => {
  it('renders children correctly', () => {
    render(<Alert type="info">Test message</Alert>);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('applies info type styling', () => {
    const { container } = render(<Alert type="info">Info message</Alert>);
    expect(container.firstChild).toHaveClass('bg-blue-50');
    expect(container.firstChild).toHaveClass('text-blue-800');
  });

  it('applies error type styling', () => {
    const { container } = render(<Alert type="error">Error message</Alert>);
    expect(container.firstChild).toHaveClass('bg-red-50');
    expect(container.firstChild).toHaveClass('text-red-800');
  });

  it('applies success type styling', () => {
    const { container } = render(<Alert type="success">Success message</Alert>);
    expect(container.firstChild).toHaveClass('bg-green-50');
    expect(container.firstChild).toHaveClass('text-green-800');
  });

  it('applies warning type styling', () => {
    const { container } = render(<Alert type="warning">Warning message</Alert>);
    expect(container.firstChild).toHaveClass('bg-yellow-50');
    expect(container.firstChild).toHaveClass('text-yellow-800');
  });

  it('has correct base classes', () => {
    const { container } = render(<Alert type="info">Alert</Alert>);
    expect(container.firstChild).toHaveClass('p-4', 'rounded-lg', 'border');
  });
});
