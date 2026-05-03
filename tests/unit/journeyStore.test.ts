import { describe, it, expect, beforeEach } from 'vitest';
import { useJourneyStore } from '../../src/store/journeyStore';

describe('journeyStore', () => {
  beforeEach(() => {
    useJourneyStore.setState({
      currentStep: 1,
      completedSteps: [],
      readinessScore: 0,
      badges: [],
      quizScores: [],
      xp: 0,
    });
  });

  it('should start at step 1 with 0 readiness', () => {
    const state = useJourneyStore.getState();
    expect(state.currentStep).toBe(1);
    expect(state.readinessScore).toBe(0);
    expect(state.xp).toBe(0);
  });

  it('should complete a step and update readiness', () => {
    useJourneyStore.getState().completeStep(1);
    const state = useJourneyStore.getState();
    expect(state.completedSteps).toContain(1);
    expect(state.currentStep).toBe(2);
    expect(state.readinessScore).toBe(Math.round((1 / 7) * 100));
  });

  it('should not duplicate completed steps', () => {
    useJourneyStore.getState().completeStep(1);
    useJourneyStore.getState().completeStep(1);
    expect(useJourneyStore.getState().completedSteps.length).toBe(1);
  });

  it('should add XP correctly', () => {
    useJourneyStore.getState().addXP(100);
    useJourneyStore.getState().addXP(50);
    expect(useJourneyStore.getState().xp).toBe(150);
  });

  it('should add badges without duplicates', () => {
    useJourneyStore.getState().addBadge('first-vote');
    useJourneyStore.getState().addBadge('first-vote');
    useJourneyStore.getState().addBadge('quiz-master');
    const badges = useJourneyStore.getState().badges;
    expect(badges.length).toBe(2);
    expect(badges).toContain('first-vote');
    expect(badges).toContain('quiz-master');
  });

  it('should track quiz scores', () => {
    useJourneyStore.getState().addQuizScore(4);
    useJourneyStore.getState().addQuizScore(5);
    expect(useJourneyStore.getState().quizScores).toEqual([4, 5]);
  });

  it('should calculate 100% readiness when all 7 steps done', () => {
    for (let i = 1; i <= 7; i++) {
      useJourneyStore.getState().completeStep(i);
    }
    expect(useJourneyStore.getState().readinessScore).toBe(100);
  });
});
