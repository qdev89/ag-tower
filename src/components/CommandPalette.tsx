import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Plug, FileText, Brain, GitBranch,
  Zap, BookOpen, Bot, Webhook, MemoryStick, Rocket,
  Workflow, Settings, BarChart3, MessageSquare, Palette,
  FileSearch, Search, Command
} from 'lucide-react';

// ============================================================
// Command Palette — Ctrl+K quick navigation
// ============================================================

interface CommandItem {
  id: string;
  label: string;
  sublabel?: string;
  icon: typeof LayoutDashboard;
  path: string;
  section: string;
}

const COMMANDS: CommandItem[] = [
  { id: 'dashboard', label: 'Dashboard', sublabel: 'System overview', icon: LayoutDashboard, path: '/', section: 'Core' },
  { id: 'mcp', label: 'MCP Servers', sublabel: 'Manage MCP connections', icon: Plug, path: '/mcp', section: 'Core' },
  { id: 'rules', label: 'Rules', sublabel: 'Edit project rules', icon: FileText, path: '/rules', section: 'Core' },
  { id: 'brain', label: 'Brain Sync', sublabel: 'Sync knowledge to cloud', icon: Brain, path: '/brain', section: 'Core' },
  { id: 'workflows', label: 'Workflows', sublabel: 'Browse workflow diagrams', icon: GitBranch, path: '/workflows', section: 'Assets' },
  { id: 'skills', label: 'Skills', sublabel: 'Installed skill catalog', icon: Zap, path: '/skills', section: 'Assets' },
  { id: 'knowledge', label: 'Knowledge Bases', sublabel: 'Knowledge items', icon: BookOpen, path: '/knowledge', section: 'Assets' },
  { id: 'sprint', label: 'Sprint Pipeline', sublabel: 'Think→Plan→Build→Ship', icon: Workflow, path: '/sprint', section: 'Pipeline' },
  { id: 'office-hours', label: 'Office Hours', sublabel: 'Product reframing wizard', icon: MessageSquare, path: '/office-hours', section: 'Pipeline' },
  { id: 'retro', label: 'Retro', sublabel: 'Developer statistics', icon: BarChart3, path: '/retro', section: 'Pipeline' },
  { id: 'deploy', label: 'Deploy', sublabel: 'Release pipeline', icon: Rocket, path: '/deploy', section: 'Pipeline' },
  { id: 'docs-health', label: 'Docs Health', sublabel: 'Documentation freshness', icon: FileSearch, path: '/docs-health', section: 'Pipeline' },
  { id: 'agents', label: 'Agents', sublabel: 'Agent configurations', icon: Bot, path: '/agents', section: 'System' },
  { id: 'hooks', label: 'Hooks', sublabel: 'Git hooks & triggers', icon: Webhook, path: '/hooks', section: 'System' },
  { id: 'memory', label: 'Memory', sublabel: 'Agent memory files', icon: MemoryStick, path: '/memory', section: 'System' },
  { id: 'design', label: 'DESIGN.md', sublabel: 'Visual design system', icon: Palette, path: '/design', section: 'System' },
  { id: 'settings', label: 'Settings', sublabel: 'Application settings', icon: Settings, path: '/settings', section: 'System' },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Filter commands
  const filtered = COMMANDS.filter(cmd =>
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    (cmd.sublabel && cmd.sublabel.toLowerCase().includes(query.toLowerCase())) ||
    cmd.section.toLowerCase().includes(query.toLowerCase())
  );

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
        setQuery('');
        setSelectedIndex(0);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Reset selection on filter change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const selectCommand = useCallback((cmd: CommandItem) => {
    navigate(cmd.path);
    setOpen(false);
    setQuery('');
  }, [navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      selectCommand(filtered[selectedIndex]);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.15s ease',
        }}
      />

      {/* Palette */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: '520px', maxWidth: '90vw',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        zIndex: 101,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        animation: 'fadeIn 0.15s ease',
      }}>
        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '14px 16px',
          borderBottom: '1px solid var(--border-primary)',
        }}>
          <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages..."
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontFamily: 'var(--font-sans)',
              fontSize: '14px',
            }}
          />
          <kbd style={{
            fontSize: '10px', fontFamily: 'var(--font-mono)',
            padding: '2px 6px', borderRadius: '4px',
            background: 'var(--bg-elevated)', color: 'var(--text-muted)',
            border: '1px solid var(--border-primary)',
          }}>
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div style={{
          maxHeight: '320px', overflowY: 'auto',
          padding: '8px',
        }}>
          {filtered.length === 0 ? (
            <div style={{
              padding: '24px', textAlign: 'center',
              color: 'var(--text-muted)', fontSize: '13px',
            }}>
              No results for "{query}"
            </div>
          ) : (
            filtered.map((cmd, i) => {
              const Icon = cmd.icon;
              const isSelected = i === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  onClick={() => selectCommand(cmd)}
                  onMouseEnter={() => setSelectedIndex(i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 12px', width: '100%', textAlign: 'left',
                    background: isSelected ? 'rgba(102,126,234,0.12)' : 'transparent',
                    border: 'none', borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer', color: 'var(--text-primary)',
                    fontFamily: 'var(--font-sans)',
                    transition: 'background 0.1s ease',
                  }}
                >
                  <div style={{
                    width: '28px', height: '28px', borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'rgba(102,126,234,0.2)' : 'var(--bg-elevated)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={14} style={{ color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500 }}>{cmd.label}</div>
                    {cmd.sublabel && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{cmd.sublabel}</div>
                    )}
                  </div>
                  <span style={{
                    fontSize: '10px', color: 'var(--text-muted)',
                    background: 'var(--bg-elevated)', padding: '2px 6px',
                    borderRadius: '4px',
                  }}>
                    {cmd.section}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer hint */}
        <div style={{
          padding: '8px 16px', borderTop: '1px solid var(--border-primary)',
          display: 'flex', alignItems: 'center', gap: '12px',
          fontSize: '10px', color: 'var(--text-muted)',
        }}>
          <span>↑↓ Navigate</span>
          <span>↵ Open</span>
          <span>ESC Close</span>
          <span style={{ marginLeft: 'auto' }}>
            <Command size={10} style={{ marginRight: '2px' }} />
            Ctrl+K to toggle
          </span>
        </div>
      </div>
    </>
  );
}
