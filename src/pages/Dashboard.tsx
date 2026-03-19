import {
  Plug, Zap, GitBranch, BookOpen, Bot, Webhook,
  MessageSquare, HardDrive, ArrowRight, Activity,
  Lightbulb, Hammer, Rocket, BarChart3, CheckCircle2,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

interface DashboardProps {
  health: SystemHealth | null;
}

// Pipeline mini-stage for the dashboard overview
function PipelineMini({ navigate }: { navigate: (p: string) => void }) {
  const stages = [
    { icon: Lightbulb, label: 'Think', color: '#f59e0b', route: '/office-hours' },
    { icon: Hammer,    label: 'Build', color: '#8b5cf6', route: '/sprint' },
    { icon: Rocket,    label: 'Ship',  color: '#ec4899', route: '/deploy' },
    { icon: BarChart3, label: 'Retro', color: '#64748b', route: '/retro' },
  ];

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0',
      justifyContent: 'center', padding: '4px 0',
    }}>
      {stages.map((s, i) => {
        const Icon = s.icon;
        return (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={() => navigate(s.route)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '6px', background: 'none', border: 'none',
                cursor: 'pointer', padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = `${s.color}12`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'none';
              }}
            >
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: `${s.color}15`, border: `2px solid ${s.color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={16} style={{ color: s.color }} />
              </div>
              <span style={{ fontSize: '10px', fontWeight: 600, color: s.color }}>
                {s.label}
              </span>
            </button>
            {i < stages.length - 1 && (
              <ArrowRight size={12} style={{
                color: 'var(--text-muted)', opacity: 0.4, marginBottom: '20px',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Quick action button
function QuickAction({ icon: Icon, label, sublabel, route, color, navigate }: {
  icon: typeof Plug; label: string; sublabel: string; route: string;
  color: string; navigate: (p: string) => void;
}) {
  return (
    <button
      onClick={() => navigate(route)}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '12px 14px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer', width: '100%', textAlign: 'left',
        transition: 'all var(--transition-fast)',
        color: 'var(--text-primary)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${color}50`;
        e.currentTarget.style.background = 'var(--bg-card-hover)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border-primary)';
        e.currentTarget.style.background = 'var(--bg-card)';
      }}
    >
      <div style={{
        width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
        background: `${color}15`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '12px', fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{sublabel}</div>
      </div>
      <ArrowRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
    </button>
  );
}

export default function Dashboard({ health }: DashboardProps) {
  const navigate = useNavigate();

  if (!health) {
    return (
      <div className="loading">
        <div className="spinner" />
        <span>Scanning Antigravity ecosystem...</span>
      </div>
    );
  }

  const stats = [
    { icon: Plug, label: 'MCP Servers', value: health.mcp_server_count, color: '#667eea', bg: 'rgba(102,126,234,0.12)' },
    { icon: Zap, label: 'Skills', value: health.skill_count, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    { icon: GitBranch, label: 'Workflows', value: health.workflow_count, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    { icon: BookOpen, label: 'Knowledge', value: health.knowledge_base_count, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    { icon: Bot, label: 'Agents', value: health.agent_count, color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
    { icon: Webhook, label: 'Hooks', value: health.hook_count, color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
    { icon: MessageSquare, label: 'Conversations', value: health.conversation_count, color: '#14b8a6', bg: 'rgba(20,184,166,0.12)' },
    { icon: HardDrive, label: 'Storage', value: `${health.conversation_size_mb.toFixed(0)} MB`, color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  ];

  const totalItems = health.mcp_server_count + health.skill_count + health.workflow_count
    + health.knowledge_base_count + health.agent_count + health.hook_count;

  return (
    <div className="fade-in">
      {/* Hero header */}
      <div style={{
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(102,126,234,0.08) 0%, rgba(118,75,162,0.06) 100%)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-primary)',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <Activity size={20} style={{ color: 'var(--accent-primary)' }} />
              <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Dashboard</h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              System overview for <strong>{health.hostname}</strong> · {health.os === 'windows' ? 'Windows' : health.os}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div className={`badge ${health.antigravity_exists ? 'badge-green' : 'badge-red'}`}>
              {health.antigravity_exists ? '● Antigravity' : '✕ Antigravity'}
            </div>
            <div className={`badge ${health.agent_dir_exists ? 'badge-green' : 'badge-red'}`}>
              {health.agent_dir_exists ? '● .agent' : '✕ .agent'}
            </div>
          </div>
        </div>

        {/* Overall health bar */}
        <div style={{ marginTop: '16px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '6px',
          }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Ecosystem Health
            </span>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--status-green)' }}>
              <TrendingUp size={12} style={{ marginRight: '4px' }} />
              {totalItems} items active
            </span>
          </div>
          <div style={{
            height: '6px', borderRadius: '3px',
            background: 'var(--bg-card)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: '3px',
              background: 'var(--accent-gradient)',
              width: `${Math.min(100, (totalItems / 200) * 100)}%`,
              transition: 'width 1s ease',
            }} />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="stat-card" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="stat-card-icon" style={{ background: stat.bg, color: stat.color }}>
                <Icon size={20} />
              </div>
              <div className="stat-card-value">
                {typeof stat.value === 'number' ? stat.value : stat.value}
              </div>
              <div className="stat-card-label">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Sprint Pipeline Overview */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <CheckCircle2 size={14} style={{ marginRight: '6px', color: 'var(--accent-primary)' }} />
              Sprint Pipeline
            </span>
            <button
              className="btn btn-sm"
              onClick={() => navigate('/sprint')}
              style={{ fontSize: '10px' }}
            >
              Open →
            </button>
          </div>
          <PipelineMini navigate={navigate} />
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Zap size={14} style={{ marginRight: '6px', color: '#f59e0b' }} />
              Quick Actions
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <QuickAction
              icon={Plug} label="Manage MCP Servers" sublabel={`${health.mcp_server_count} configured`}
              route="/mcp" color="#667eea" navigate={navigate}
            />
            <QuickAction
              icon={Zap} label="Browse Skills" sublabel={`${health.skill_count} installed`}
              route="/skills" color="#f59e0b" navigate={navigate}
            />
            <QuickAction
              icon={GitBranch} label="View Workflows" sublabel={`${health.workflow_count} available`}
              route="/workflows" color="#10b981" navigate={navigate}
            />
            <QuickAction
              icon={BookOpen} label="Knowledge Bases" sublabel={`${health.knowledge_base_count} loaded`}
              route="/knowledge" color="#3b82f6" navigate={navigate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
