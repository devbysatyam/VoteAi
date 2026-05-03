import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import OfflineIndicator from '../../src/components/OfflineIndicator';

describe('OfflineIndicator', () => {
  let originalOnLine: boolean;

  beforeEach(() => {
    originalOnLine = navigator.onLine;
  });

  it('should not render when online', () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
    const { container } = render(<OfflineIndicator />);
    expect(container.innerHTML).toBe('');
    Object.defineProperty(navigator, 'onLine', { value: originalOnLine, configurable: true });
  });

  it('should render alert when offline', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    render(<OfflineIndicator />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/offline/i)).toBeInTheDocument();
    Object.defineProperty(navigator, 'onLine', { value: originalOnLine, configurable: true });
  });

  it('should respond to online/offline events', () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
    const { container } = render(<OfflineIndicator />);
    expect(container.innerHTML).toBe('');

    window.dispatchEvent(new Event('offline'));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    window.dispatchEvent(new Event('online'));
    expect(container.querySelector('[role="alert"]')).toBeNull();

    Object.defineProperty(navigator, 'onLine', { value: originalOnLine, configurable: true });
  });
});
