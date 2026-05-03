import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore } from '../../src/store/authStore';

// Mock Gemini Service
vi.mock('../../src/services/gemini', () => ({
  sendChatMessage: vi.fn((msg) => Promise.resolve(`AI response to: ${msg}`))
}));

function resetStores() {
  useAuthStore.setState({ isAuthenticated: false, isGuest: false, user: null });
}

describe('AI Chat Integration', () => {
  beforeEach(() => {
    resetStores();
    useAuthStore.getState().loginAsGuest();
  });

  it('should send and receive messages in the chat interface', async () => {
    const { default: AIChat } = await import('../../src/pages/chat/AIChat');
    render(<MemoryRouter><AIChat /></MemoryRouter>);

    const input = screen.getByPlaceholderText(/Ask about elections/i);
    fireEvent.change(input, { target: { value: 'How to vote?' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('How to vote?')).toBeInTheDocument();
      expect(screen.getByText('AI response to: How to vote?')).toBeInTheDocument();
    });
  });
});

describe('Voter Card Display Integration', () => {
  beforeEach(resetStores);

  it('should display correct user details on the digital voter card', async () => {
    useAuthStore.getState().setUser({
      name: 'Aditya Voter',
      state: 'Maharashtra',
      constituency: 'Pune',
      age: 21,
      isFirstTimeVoter: true,
      voterType: 'general',
      photoUrl: ''
    });

    const { default: VoterIDCard } = await import('../../src/pages/onboarding/VoterIDCard');
    render(<MemoryRouter><VoterIDCard /></MemoryRouter>);

    expect(screen.getByText(/Aditya Voter/i)).toBeInTheDocument();
    expect(screen.getByText(/Pune/i)).toBeInTheDocument();
    expect(screen.getByText(/Maharashtra/i)).toBeInTheDocument();
  });
});
