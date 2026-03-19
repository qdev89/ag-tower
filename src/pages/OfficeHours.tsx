import { useState } from 'react';
import {
  MessageSquare, Lightbulb, Target,
  Send, ChevronRight, Sparkles,
  ArrowRight
} from 'lucide-react';

// ============================================================
// Office Hours — gstack /office-hours inspired
// Product reframing before coding
// ============================================================

interface FramingOption {
  id: string;
  title: string;
  description: string;
  effort: 'XS' | 'S' | 'M' | 'L' | 'XL';
  confidence: number; // 1-10
  pros: string[];
  cons: string[];
}

interface ConversationMessage {
  role: 'user' | 'advisor';
  content: string;
  timestamp: string;
}

const demoConversation: ConversationMessage[] = [
  {
    role: 'user',
    content: 'I want to add a real-time collaboration feature to AG Tower so multiple developers can see each other\'s changes.',
    timestamp: '10:32 AM'
  },
  {
    role: 'advisor',
    content: '🤔 Interesting. Let me challenge that framing.\n\n**Question 1:** What\'s the simplest version that proves this is valuable? Real-time collaboration is a massive engineering effort (WebSockets, CRDTs, conflict resolution).\n\n**Question 2:** Is the real pain "collaboration" or "visibility"? If developers just need to see what others are doing (not edit simultaneously), a simple activity feed might be 10x simpler.\n\n**Question 3:** What happens if you DON\'T build this? Are developers actually blocked, or is this a "nice to have"?',
    timestamp: '10:33 AM'
  },
  {
    role: 'user',
    content: 'Good point. The real issue is visibility — knowing what sprint tasks others are working on.',
    timestamp: '10:35 AM'
  },
  {
    role: 'advisor',
    content: '✨ **Reframe detected!** You shifted from "real-time co-editing" to "team visibility".\n\nHere are 3 implementation framings:',
    timestamp: '10:36 AM'
  },
];

const demoFramings: FramingOption[] = [
  {
    id: 'a',
    title: 'Activity Feed (MVP)',
    description: 'A simple activity log showing who is working on what, with status updates from git commits and sprint board changes.',
    effort: 'S',
    confidence: 9,
    pros: ['Simple to build', 'Solves core need', 'No real-time infra needed'],
    cons: ['Not real-time', 'Manual updates needed', 'Limited interactivity'],
  },
  {
    id: 'b',
    title: 'Live Status Board',
    description: 'A shared Sprint Pipeline board that auto-updates via polling every 30 seconds, showing each dev\'s current task and phase.',
    effort: 'M',
    confidence: 7,
    pros: ['Near real-time', 'Visual and intuitive', 'Builds on existing Sprint Pipeline'],
    cons: ['Polling overhead', 'Needs shared state', 'Auth complexity'],
  },
  {
    id: 'c',
    title: 'Full Collaboration Suite',
    description: 'WebSocket-based real-time board with presence indicators, live cursors, and chat — like a mini Figma for sprint planning.',
    effort: 'XL',
    confidence: 4,
    pros: ['Wow factor', 'Full collaboration', 'Cutting edge'],
    cons: ['Months of work', 'Infrastructure cost', 'Over-engineered for need'],
  },
];

const effortColors: Record<string, string> = {
  XS: 'var(--status-green)',
  S: 'var(--status-green)',
  M: 'var(--status-blue)',
  L: 'var(--status-yellow)',
  XL: 'var(--status-red)',
};

export default function OfficeHours() {
  const [messages] = useState(demoConversation);
  const [framings] = useState(demoFramings);
  const [inputValue, setInputValue] = useState('');
  const [selectedFraming, setSelectedFraming] = useState<string | null>(null);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MessageSquare size={22} style={{ color: 'var(--status-yellow)' }} />
          Office Hours
        </h2>
        <p>Product reframing wizard · Challenge assumptions before coding</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '16px' }}>
        {/* Conversation Panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} style={{ color: 'var(--status-yellow)' }} />
              <span className="card-title">YC Partner Advisor</span>
            </div>
            <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--status-green)' }}>
              Online
            </span>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '85%',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-lg)',
                  background: msg.role === 'user'
                    ? 'var(--text-accent)'
                    : 'var(--bg-elevated)',
                  color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-line',
                }}>
                  {msg.content}
                  <div style={{
                    fontSize: '10px', marginTop: '6px',
                    opacity: 0.6,
                    textAlign: msg.role === 'user' ? 'right' : 'left',
                  }}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border-primary)',
            display: 'flex', gap: '8px',
          }}>
            <input
              style={{
                flex: 1,
                background: 'var(--bg-input)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                fontSize: '13px',
                color: 'var(--text-primary)',
              }}
              placeholder="Describe what you want to build..."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setInputValue('')}
            />
            <button className="btn btn-primary">
              <Send size={16} />
            </button>
          </div>
        </div>

        {/* Framings Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <Lightbulb size={14} style={{ marginRight: '4px', color: 'var(--status-yellow)' }} />
                Alternative Framings
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              AI-generated implementation approaches ranked by confidence.
            </p>

            {framings.map((f) => (
              <div
                key={f.id}
                onClick={() => setSelectedFraming(f.id)}
                style={{
                  padding: '14px',
                  marginBottom: '10px',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${selectedFraming === f.id ? 'var(--text-accent)' : 'var(--border-primary)'}`,
                  background: selectedFraming === f.id ? 'rgba(139,92,246,0.06)' : 'var(--bg-secondary)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>
                    {f.title}
                  </span>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span className="badge" style={{
                      background: `${effortColors[f.effort]}20`,
                      color: effortColors[f.effort],
                      fontSize: '10px',
                    }}>
                      {f.effort}
                    </span>
                    <span style={{
                      fontSize: '10px', fontFamily: 'var(--font-mono)',
                      color: f.confidence >= 7 ? 'var(--status-green)' :
                        f.confidence >= 5 ? 'var(--status-yellow)' : 'var(--status-red)',
                    }}>
                      {f.confidence}/10
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                  {f.description}
                </p>

                {selectedFraming === f.id && (
                  <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--status-green)', marginBottom: '4px' }}>
                        ✅ Pros
                      </div>
                      {f.pros.map(p => (
                        <div key={p} style={{ fontSize: '10px', color: 'var(--text-muted)', padding: '2px 0' }}>
                          • {p}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--status-red)', marginBottom: '4px' }}>
                        ❌ Cons
                      </div>
                      {f.cons.map(c => (
                        <div key={c} style={{ fontSize: '10px', color: 'var(--text-muted)', padding: '2px 0' }}>
                          • {c}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {selectedFraming && (
              <button className="btn btn-primary" style={{ width: '100%' }}>
                <ArrowRight size={14} /> Generate DESIGN.md from "{framings.find(f => f.id === selectedFraming)?.title}"
              </button>
            )}
          </div>

          {/* Forcing Questions */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <Target size={14} style={{ marginRight: '4px', color: 'var(--status-blue)' }} />
                Forcing Questions
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                'What\'s the simplest version that proves value?',
                'Who\'s the real user and what\'s their pain?',
                'What happens if we DON\'T build this?',
                'What\'s the most counterintuitive approach?',
                'What would a 10x simpler solution look like?',
              ].map((q, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 10px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11px', color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}>
                  <ChevronRight size={12} style={{ color: 'var(--text-accent)', flexShrink: 0 }} />
                  {q}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
