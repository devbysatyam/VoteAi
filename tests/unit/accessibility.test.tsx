import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

describe('Accessibility: AppLayout', () => {
  it('should have main landmark', async () => {
    const { default: AppLayout } = await import('../../src/components/layout/AppLayout');
    const { useAuthStore } = await import('../../src/store/authStore');
    useAuthStore.setState({
      isAuthenticated: true,
      isGuest: true,
      user: { name: 'Test', state: 'Delhi', constituency: 'Test', age: 21, isFirstTimeVoter: true, voterType: 'general', photoUrl: '' },
    });

    render(
      <MemoryRouter initialEntries={['/home']}>
        <AppLayout />
      </MemoryRouter>
    );

    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should have navigation landmark with label', async () => {
    const { default: AppLayout } = await import('../../src/components/layout/AppLayout');
    render(
      <MemoryRouter initialEntries={['/home']}>
        <AppLayout />
      </MemoryRouter>
    );

    const nav = screen.getByRole('navigation', { name: /main navigation/i });
    expect(nav).toBeInTheDocument();
  });

  it('should have aria-current on active nav item', async () => {
    const { default: AppLayout } = await import('../../src/components/layout/AppLayout');
    render(
      <MemoryRouter initialEntries={['/home']}>
        <AppLayout />
      </MemoryRouter>
    );

    const homeBtn = screen.getByRole('button', { name: 'Home' });
    expect(homeBtn).toHaveAttribute('aria-current', 'page');
  });

  it('should have aria-label on AI chat FAB', async () => {
    const { default: AppLayout } = await import('../../src/components/layout/AppLayout');
    render(
      <MemoryRouter initialEntries={['/home']}>
        <AppLayout />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: 'Open AI Assistant' })).toBeInTheDocument();
  });
});

describe('Accessibility: OnboardingLayout', () => {
  it('should have main landmark', async () => {
    const { default: OnboardingLayout } = await import('../../src/components/layout/OnboardingLayout');
    render(
      <MemoryRouter>
        <OnboardingLayout />
      </MemoryRouter>
    );

    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});

describe('Accessibility: NotFound', () => {
  it('should have main landmark and heading', async () => {
    const { default: NotFound } = await import('../../src/pages/NotFound');
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument();
    expect(screen.getByText(/go home/i)).toBeInTheDocument();
    expect(screen.getByText(/go back/i)).toBeInTheDocument();
  });
});
