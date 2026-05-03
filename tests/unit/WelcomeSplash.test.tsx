import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import WelcomeSplash from '../../src/pages/onboarding/WelcomeSplash';

describe('WelcomeSplash', () => {
  it('should render the main heading', () => {
    render(
      <MemoryRouter>
        <WelcomeSplash />
      </MemoryRouter>
    );
    expect(screen.getByText('Vote Smart. Vote Right.')).toBeInTheDocument();
  });

  it('should render the Get Started button', () => {
    render(
      <MemoryRouter>
        <WelcomeSplash />
      </MemoryRouter>
    );
    expect(screen.getByText('Get Started →')).toBeInTheDocument();
  });

  it('should render all 3 feature badges', () => {
    render(
      <MemoryRouter>
        <WelcomeSplash />
      </MemoryRouter>
    );
    expect(screen.getByText(/AI Guide/)).toBeInTheDocument();
    expect(screen.getByText(/EVM Simulator/)).toBeInTheDocument();
    expect(screen.getByText(/Booth Finder/)).toBeInTheDocument();
  });

  it('should render the description text', () => {
    render(
      <MemoryRouter>
        <WelcomeSplash />
      </MemoryRouter>
    );
    expect(screen.getByText(/AI-powered guide/)).toBeInTheDocument();
  });

  it('should render step indicators', () => {
    const { container } = render(
      <MemoryRouter>
        <WelcomeSplash />
      </MemoryRouter>
    );
    const pills = container.querySelectorAll('.step-pill');
    expect(pills.length).toBe(5);
  });
});
