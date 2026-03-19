import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

// ============================================================
// Theme Switcher — Light/Dark mode toggle
// ============================================================

type Theme = 'dark' | 'light';

const LIGHT_TOKENS: Record<string, string> = {
  '--bg-primary': '#f8fafc',
  '--bg-secondary': '#ffffff',
  '--bg-card': '#ffffff',
  '--bg-card-hover': '#f1f5f9',
  '--bg-elevated': '#e2e8f0',
  '--bg-input': '#f1f5f9',
  '--text-primary': '#0f172a',
  '--text-secondary': '#475569',
  '--text-muted': '#94a3b8',
  '--text-accent': '#6366f1',
  '--border-primary': 'rgba(15, 23, 42, 0.08)',
  '--border-hover': 'rgba(15, 23, 42, 0.15)',
  '--border-accent': 'rgba(99, 102, 241, 0.3)',
  '--shadow-card': '0 4px 24px rgba(0, 0, 0, 0.06)',
  '--shadow-hover': '0 8px 40px rgba(0, 0, 0, 0.1)',
  '--accent-glow': 'rgba(99, 102, 241, 0.15)',
};

const DARK_TOKENS: Record<string, string> = {
  '--bg-primary': '#06080f',
  '--bg-secondary': '#0c1020',
  '--bg-card': '#111827',
  '--bg-card-hover': '#1a2238',
  '--bg-elevated': '#1e293b',
  '--bg-input': '#0f172a',
  '--text-primary': '#f1f5f9',
  '--text-secondary': '#94a3b8',
  '--text-muted': '#64748b',
  '--text-accent': '#a5b4fc',
  '--border-primary': 'rgba(148, 163, 184, 0.1)',
  '--border-hover': 'rgba(148, 163, 184, 0.2)',
  '--border-accent': 'rgba(102, 126, 234, 0.4)',
  '--shadow-card': '0 4px 24px rgba(0, 0, 0, 0.3)',
  '--shadow-hover': '0 8px 40px rgba(0, 0, 0, 0.4)',
  '--accent-glow': 'rgba(102, 126, 234, 0.3)',
};

function applyTheme(theme: Theme) {
  const tokens = theme === 'light' ? LIGHT_TOKENS : DARK_TOKENS;
  const root = document.documentElement;
  Object.entries(tokens).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  localStorage.setItem('ag-tower-theme', theme);
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('ag-tower-theme') as Theme | null;
    return saved || 'dark';
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  return { theme, toggle };
}

export default function ThemeSwitcher({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-primary)',
        background: 'var(--bg-elevated)',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
        color: theme === 'dark' ? '#f59e0b' : '#6366f1',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border-hover)';
        e.currentTarget.style.background = 'var(--bg-card-hover)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border-primary)';
        e.currentTarget.style.background = 'var(--bg-elevated)';
      }}
    >
      {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
