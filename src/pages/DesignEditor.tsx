import { useState, useEffect } from 'react';
import {
  Palette, Type, Save, RefreshCw,
  CheckCircle2, AlertTriangle
} from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

// ============================================================
// DESIGN.md Editor — gstack DESIGN.md pattern
// Visual design system management
// ============================================================

export default function DesignEditor() {
  const [content, setContent] = useState('');
  const [savedContent, setSavedContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    invoke<string>('get_design_md')
      .then(c => {
        if (c) {
          setContent(c);
          setSavedContent(c);
        } else {
          const template = `# Design Document: AG Tower

## Framing
- Problem: Need a unified GUI for managing the Antigravity ecosystem
- User: Developers using AI-assisted coding tools
- Pain: No visual way to manage MCP servers, skills, workflows, and knowledge

## Design System

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| \`--bg-primary\` | #06080f | App background |
| \`--accent-primary\` | #667eea | Primary accent |
| \`--accent-secondary\` | #764ba2 | Secondary accent |
| \`--status-green\` | #10b981 | Success states |
| \`--status-red\` | #ef4444 | Error states |

### Typography
- **Headings:** Inter, 700-800 weight
- **Body:** Inter, 400-500 weight
- **Code:** JetBrains Mono, 400 weight

### Spacing
- Card padding: 16-20px
- Grid gap: 12-16px
- Section margin: 24px

## Component Library
- Cards with glassmorphic backgrounds
- Badge system (status colors)
- Toggle switches
- Icon buttons (lucide-react)
- Progress bars with gradient fills

## Selected Approach
- Desktop-first Tauri app with React
- Dark theme as default
- Premium glassmorphic UI
- gstack-inspired workflow pipeline

## Alternatives Considered
1. Web-only PWA — Rejected: loses native performance
2. Electron — Rejected: too heavy, Tauri is lighter
3. CLI-only — Rejected: we want visual management
`;
          setContent(template);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await invoke('save_design_md', { content });
      setSavedContent(content);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save:', err);
    }
    setSaving(false);
  };

  const isDirty = content !== savedContent;

  if (loading) {
    return (
      <div className="fade-in">
        <div className="empty-state">
          <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} />
          <p>Loading DESIGN.md...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Palette size={22} style={{ color: 'var(--text-accent)' }} />
              DESIGN.md Editor
            </h2>
            <p>Visual design system · Flows through all downstream skills</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {saved && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--status-green)' }}>
                <CheckCircle2 size={14} /> Saved
              </span>
            )}
            {isDirty && !saved && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--status-yellow)' }}>
                <AlertTriangle size={14} /> Unsaved changes
              </span>
            )}
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={!isDirty || saving}
            >
              <Save size={14} /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px' }}>
        {/* Editor */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '10px 16px',
            borderBottom: '1px solid var(--border-primary)',
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'var(--bg-secondary)',
          }}>
            <code style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-accent)' }}>
              .agent/memory/DESIGN.md
            </code>
            <span style={{
              fontSize: '10px', color: 'var(--text-muted)', marginLeft: 'auto',
              fontFamily: 'var(--font-mono)',
            }}>
              {content.length} chars · {content.split('\n').length} lines
            </span>
          </div>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            spellCheck={false}
            style={{
              width: '100%',
              minHeight: 'calc(100vh - 240px)',
              padding: '16px',
              background: 'var(--bg-primary)',
              border: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              lineHeight: '1.7',
              resize: 'none',
              outline: 'none',
            }}
          />
        </div>

        {/* Quick reference panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Color palette preview */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <Palette size={14} style={{ marginRight: '4px', color: 'var(--text-accent)' }} />
                Color Palette
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
              {[
                { color: '#667eea', name: 'Primary' },
                { color: '#764ba2', name: 'Secondary' },
                { color: '#10b981', name: 'Green' },
                { color: '#f59e0b', name: 'Yellow' },
                { color: '#ef4444', name: 'Red' },
                { color: '#3b82f6', name: 'Blue' },
                { color: '#06080f', name: 'BG' },
                { color: '#111827', name: 'Card' },
                { color: '#f1f5f9', name: 'Text' },
                { color: '#64748b', name: 'Muted' },
              ].map(c => (
                <div key={c.name} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '100%', aspectRatio: '1',
                    borderRadius: 'var(--radius-sm)',
                    background: c.color,
                    border: '1px solid var(--border-primary)',
                    marginBottom: '4px',
                  }} title={c.color} />
                  <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>{c.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Typography preview */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <Type size={14} style={{ marginRight: '4px', color: 'var(--status-blue)' }} />
                Typography
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '18px', fontWeight: 800 }}>Heading 1</span>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Inter 800 · 18px</div>
              </div>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 700 }}>Heading 2</span>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Inter 700 · 14px</div>
              </div>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 400 }}>Body text</span>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Inter 400 · 13px</div>
              </div>
              <div>
                <code style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}>Code text</code>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>JetBrains Mono · 12px</div>
              </div>
            </div>
          </div>

          {/* gstack note */}
          <div className="card" style={{
            background: 'rgba(139,92,246,0.06)',
            border: '1px solid rgba(139,92,246,0.2)',
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-accent)', fontWeight: 600, marginBottom: '6px' }}>
              💡 gstack Pattern
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
              DESIGN.md flows through ALL downstream skills. When you update this document,
              every agent (Review, QA, Ship) will use it as context for their decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
