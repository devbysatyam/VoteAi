import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendChatMessage } from '../../services/gemini';
import { validateMessage } from '../../utils/validation';

interface Message { role: 'user' | 'ai'; text: string; timestamp: number; }

export default function AIChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: '👋 Hi! I\'m your AI election guide, powered by Gemini. Ask me anything about voting, candidates, or the election process.', timestamp: Date.now() },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickReplies = [
    'How to check voter list?',
    'What is NOTA?',
    'Documents needed?',
    'How does EVM work?',
    'Am I eligible to vote?',
    'Where is my booth?',
  ];

  const handleSend = async (text: string) => {
    const { valid, sanitized, error } = validateMessage(text);
    if (!valid) {
      if (error) {
        setMessages(prev => [...prev, { role: 'ai', text: `⚠️ ${error}`, timestamp: Date.now() }]);
      }
      return;
    }

    setMessages(prev => [...prev, { role: 'user', text: sanitized, timestamp: Date.now() }]);
    setInput('');
    setTyping(true);

    try {
      const reply = await sendChatMessage(sanitized);
      setMessages(prev => [...prev, { role: 'ai', text: reply, timestamp: Date.now() }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
      }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)' }} role="region" aria-label="AI Chat">
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '0.5px solid var(--color-border)', background: 'var(--color-card)' }}>
        <button onClick={() => navigate(-1)} className="back-btn" aria-label="Go back">←</button>
        <div style={{ flex: 1 }}>
          <h1 className="text-card" style={{ margin: 0 }}>Election Assistant</h1>
          <div className="text-caption" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: '#4CAF50', display: 'inline-block' }} aria-hidden="true" />
            Powered by Gemini AI
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" aria-label="Text to speech">🔊</button>
      </header>

      {/* Messages */}
      <div role="log" aria-live="polite" aria-label="Chat messages" style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'ai' ? 'flex-start' : 'flex-end' }}>
            <div className={`chat-bubble ${msg.role === 'ai' ? 'chat-ai' : 'chat-user'}`}>
              {msg.text}
            </div>
            <div className="text-caption" style={{ marginTop: 2, fontSize: 9 }}>
              {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}

        {typing && (
          <div className="chat-bubble chat-ai" role="status" aria-label="Assistant is typing" style={{ display: 'flex', gap: 4 }}>
            <span className="animate-pulse" aria-hidden="true">●</span>
            <span className="animate-pulse" aria-hidden="true" style={{ animationDelay: '0.2s' }}>●</span>
            <span className="animate-pulse" aria-hidden="true" style={{ animationDelay: '0.4s' }}>●</span>
          </div>
        )}

        {/* Quick replies */}
        {messages.length <= 2 && !typing && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {quickReplies.map(qr => (
              <button key={qr} className="btn btn-sm btn-accent-light" onClick={() => handleSend(qr)}>
                {qr}
              </button>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px', borderTop: '0.5px solid var(--color-border)', background: 'var(--color-card)', display: 'flex', gap: 8 }}>
        <input
          className="input"
          style={{ flex: 1 }}
          placeholder="Ask about elections..."
          value={input}
          maxLength={2000}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(input); } }}
          aria-label="Type your message"
        />
        <button
          className="btn btn-primary"
          onClick={() => handleSend(input)}
          disabled={typing || !input.trim()}
          aria-label="Send message"
          style={{ width: 48, padding: 0, borderRadius: 24, opacity: typing || !input.trim() ? 0.5 : 1 }}
        >
          ↑
        </button>
      </div>
    </div>
  );
}
