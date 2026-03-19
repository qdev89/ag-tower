import { BrowserRouter, Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Plug, FileText, Brain, GitBranch,
  Zap, BookOpen, Bot, Webhook, MemoryStick, Rocket,
  Workflow, Settings, BarChart3, MessageSquare, Palette,
  FileSearch, Command
} from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

import Dashboard from './pages/Dashboard';
import McpManager from './pages/McpManager';
import RulesEditor from './pages/RulesEditor';
import BrainSync from './pages/BrainSync';
import WorkflowBrowser from './pages/WorkflowBrowser';
import SkillsCatalog from './pages/SkillsCatalog';
import KnowledgeBases from './pages/KnowledgeBases';
import Agents from './pages/Agents';
import Hooks from './pages/Hooks';
import MemoryPage from './pages/Memory';
import SprintPipeline from './pages/SprintPipeline';
import Deploy from './pages/Deploy';
import SettingsPage from './pages/Settings';
import Retro from './pages/Retro';
import OfficeHours from './pages/OfficeHours';
import DesignEditor from './pages/DesignEditor';
import DocsHealth from './pages/DocsHealth';

import ThemeSwitcher, { useTheme } from './components/ThemeSwitcher';
import CommandPalette from './components/CommandPalette';
import ToastContainer from './components/Toast';

import './index.css';

interface SystemHealth {
  hostname: string;
  os: string;
  mcp_server_count: number;
  skill_count: number;
  workflow_count: number;
  knowledge_base_count: number;
  agent_count: number;
  hook_count: number;
  conversation_count: number;
  conversation_size_mb: number;
  antigravity_exists: boolean;
  agent_dir_exists: boolean;
}

// Only items with paths (filter out section headers for keyboard nav)
const navItems = [
  { section: 'Core' },
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', key: 'dashboard' },
  { path: '/mcp', icon: Plug, label: 'MCP Servers', key: 'mcp_server_count' },
  { path: '/rules', icon: FileText, label: 'Rules', key: 'rules' },
  { path: '/brain', icon: Brain, label: 'Brain Sync', key: 'brain' },
  { section: 'Assets' },
  { path: '/workflows', icon: GitBranch, label: 'Workflows', key: 'workflow_count' },
  { path: '/skills', icon: Zap, label: 'Skills', key: 'skill_count' },
  { path: '/knowledge', icon: BookOpen, label: 'Knowledge', key: 'knowledge_base_count' },
  { section: 'Pipeline' },
  { path: '/sprint', icon: Workflow, label: 'Sprint Pipeline', key: 'sprint' },
  { path: '/office-hours', icon: MessageSquare, label: 'Office Hours', key: 'office_hours' },
  { path: '/retro', icon: BarChart3, label: 'Retro', key: 'retro' },
  { path: '/deploy', icon: Rocket, label: 'Deploy', key: 'deploy' },
  { path: '/docs-health', icon: FileSearch, label: 'Docs Health', key: 'docs' },
  { section: 'System' },
  { path: '/agents', icon: Bot, label: 'Agents', key: 'agent_count' },
  { path: '/hooks', icon: Webhook, label: 'Hooks', key: 'hook_count' },
  { path: '/memory', icon: MemoryStick, label: 'Memory', key: 'memory' },
  { path: '/design', icon: Palette, label: 'DESIGN.md', key: 'design' },
  { path: '/settings', icon: Settings, label: 'Settings', key: 'settings' },
];

// Extract only navigable items for keyboard nav
const navigableItems = navItems.filter(item => 'path' in item && item.path) as Array<{ path: string; icon: typeof LayoutDashboard; label: string; key: string }>;

function Sidebar({ health, theme, onToggleTheme }: {
  health: SystemHealth | null;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef<HTMLElement>(null);
  const [focusIndex, setFocusIndex] = useState(-1);

  const getBadge = (key: string): string | null => {
    if (!health) return null;
    const h = health as unknown as Record<string, unknown>;
    if (key in h && typeof h[key] === 'number') {
      return String(h[key]);
    }
    return null;
  };

  // Keyboard navigation in sidebar
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Only when sidebar is focused
    if (!navRef.current?.contains(document.activeElement) && focusIndex === -1) return;

    if (e.key === 'ArrowDown' || e.key === 'j') {
      e.preventDefault();
      setFocusIndex(i => {
        const next = Math.min(i + 1, navigableItems.length - 1);
        return next;
      });
    } else if (e.key === 'ArrowUp' || e.key === 'k') {
      e.preventDefault();
      setFocusIndex(i => {
        const prev = Math.max(i - 1, 0);
        return prev;
      });
    } else if (e.key === 'Enter' && focusIndex >= 0) {
      e.preventDefault();
      navigate(navigableItems[focusIndex].path);
    }
  }, [focusIndex, navigate]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Reset focus when route changes
  useEffect(() => {
    setFocusIndex(-1);
  }, [location.pathname]);

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">🗼</div>
        <div style={{ flex: 1 }}>
          <h1>AG Tower</h1>
          <span>Antigravity Control</span>
        </div>
        <ThemeSwitcher theme={theme} onToggle={onToggleTheme} />
      </div>
      <nav className="sidebar-nav" ref={navRef}>
        {navItems.map((item, i) => {
          if ('section' in item && !('path' in item)) {
            return <div key={i} className="sidebar-section-label">{item.section}</div>;
          }
          if (!('path' in item)) return null;
          const Icon = item.icon!;
          const badge = getBadge(item.key!);
          const isActive = location.pathname === item.path;
          const navIdx = navigableItems.findIndex(n => n.path === item.path);
          const isFocused = navIdx === focusIndex;
          return (
            <NavLink
              key={item.path}
              to={item.path!}
              className={`sidebar-link ${isActive ? 'active' : ''} ${isFocused ? 'focused' : ''}`}
            >
              <Icon className="icon" size={18} />
              <span>{item.label}</span>
              {badge && <span className="sidebar-badge">{badge}</span>}
            </NavLink>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-machine">
          <div className="sidebar-machine-dot" />
          <span>{health?.hostname || 'Connecting...'}</span>
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <kbd style={{
              fontSize: '9px', fontFamily: 'var(--font-mono)',
              padding: '1px 4px', borderRadius: '3px',
              background: 'var(--bg-elevated)', color: 'var(--text-muted)',
              border: '1px solid var(--border-primary)',
            }}>
              <Command size={8} /> K
            </kbd>
            <span style={{ opacity: 0.5 }}>
              {health?.os === 'windows' ? '🪟' : '🐧'}
            </span>
          </span>
        </div>
      </div>
    </aside>
  );
}


export default function App() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const { theme, toggle: toggleTheme } = useTheme();

  useEffect(() => {
    invoke<SystemHealth>('get_system_health')
      .then(setHealth)
      .catch(console.error);
  }, []);

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar health={health} theme={theme} onToggleTheme={toggleTheme} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard health={health} />} />
            <Route path="/mcp" element={<McpManager />} />
            <Route path="/rules" element={<RulesEditor />} />
            <Route path="/brain" element={<BrainSync />} />
            <Route path="/workflows" element={<WorkflowBrowser />} />
            <Route path="/skills" element={<SkillsCatalog />} />
            <Route path="/knowledge" element={<KnowledgeBases />} />
            <Route path="/sprint" element={<SprintPipeline />} />
            <Route path="/office-hours" element={<OfficeHours />} />
            <Route path="/retro" element={<Retro />} />
            <Route path="/deploy" element={<Deploy />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/hooks" element={<Hooks />} />
            <Route path="/memory" element={<MemoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/design" element={<DesignEditor />} />
            <Route path="/docs-health" element={<DocsHealth />} />
          </Routes>
        </main>
        <CommandPalette />
        <ToastContainer />
      </div>
    </BrowserRouter>
  );
}
