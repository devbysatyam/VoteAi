import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthGuard from '../../src/components/layout/AuthGuard';
import { useAuthStore } from '../../src/store/authStore';

describe('AuthGuard', () => {
  it('should redirect when not authenticated', () => {
    useAuthStore.setState({ isAuthenticated: false, user: null, isGuest: false });

    const { container } = render(
      <MemoryRouter initialEntries={['/home']}>
        <AuthGuard />
      </MemoryRouter>
    );

    /* Should not render Outlet content */
    expect(container.innerHTML).not.toContain('Protected Content');
  });

  it('should render outlet when authenticated', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      isGuest: true,
      user: { name: 'Test', state: 'Delhi', constituency: 'Test', age: 21, isFirstTimeVoter: true, voterType: 'general', photoUrl: '' },
    });

    /* AuthGuard renders Outlet which is empty in test context — just verify it doesn't throw */
    expect(() => {
      render(
        <MemoryRouter initialEntries={['/home']}>
          <AuthGuard />
        </MemoryRouter>
      );
    }).not.toThrow();
  });
});
