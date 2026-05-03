import { describe, it, expect } from 'vitest';
import { sendChatMessage } from '../../src/services/gemini';

describe('Gemini service (offline fallback)', () => {
  it('should return eligibility info for age questions', async () => {
    const reply = await sendChatMessage('What is the voting age?');
    expect(reply).toContain('18');
  });

  it('should return booth info for booth questions', async () => {
    const reply = await sendChatMessage('Where is my polling booth?');
    expect(reply).toContain('booth');
  });

  it('should return EVM info for EVM questions', async () => {
    const reply = await sendChatMessage('How does the EVM machine work?');
    expect(reply).toContain('EVM');
  });

  it('should return document info for document questions', async () => {
    const reply = await sendChatMessage('What documents do I need to carry?');
    expect(reply).toContain('Voter ID');
  });

  it('should return NOTA info for NOTA questions', async () => {
    const reply = await sendChatMessage('What is NOTA?');
    expect(reply).toContain('NOTA');
  });

  it('should return general response for unknown queries', async () => {
    const reply = await sendChatMessage('Tell me something random');
    expect(reply.length).toBeGreaterThan(10);
  });

  it('should cache responses for repeated queries', async () => {
    const reply1 = await sendChatMessage('What is the voting age?');
    const reply2 = await sendChatMessage('What is the voting age?');
    expect(reply1).toBe(reply2);
  });
});
