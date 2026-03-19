import { Plug, Zap, GitBranch, BookOpen, Bot, Webhook, MessageSquare, HardDrive } from 'lucide-react';

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

export default function Dashboard({ health }: DashboardProps) {
  if (!health) {
    return (
      <div className="loading">
        <div className="spinner" />
        <span>Scanning Antigravity ecosystem...</span>
      </div>
    );
  }

  const stats = [
    {
      icon: Plug,
      label: 'MCP Servers',
      value: health.mcp_server_count,
      color: '#667eea',
      bg: 'rgba(102, 126, 234, 0.12)',
    },
    {
      icon: Zap,
      label: 'Skills',
      value: health.skill_count,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.12)',
    },
    {
      icon: GitBranch,
      label: 'Workflows',
      value: health.workflow_count,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.12)',
    },
    {
      icon: BookOpen,
      label: 'Knowledge Bases',
      value: health.knowledge_base_count,
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.12)',
    },
    {
      icon: Bot,
      label: 'Agents',
      value: health.agent_count,
      color: '#a78bfa',
      bg: 'rgba(167, 139, 250, 0.12)',
    },
    {
      icon: Webhook,
      label: 'Hooks',
      value: health.hook_count,
      color: '#ec4899',
      bg: 'rgba(236, 72, 153, 0.12)',
    },
    {
      icon: MessageSquare,
      label: 'Conversations',
      value: health.conversation_count,
      color: '#14b8a6',
      bg: 'rgba(20, 184, 166, 0.12)',
    },
    {
      icon: HardDrive,
      label: 'Conv. Storage',
      value: `${health.conversation_size_mb.toFixed(0)} MB`,
      color: '#f97316',
      bg: 'rgba(249, 115, 22, 0.12)',
    },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>
          System overview for <strong>{health.hostname}</strong> · {health.os === 'windows' ? 'Windows' : health.os}
        </p>
      </div>

      {/* Health status */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <div className={`badge ${health.antigravity_exists ? 'badge-green' : 'badge-red'}`}>
          {health.antigravity_exists ? '● Antigravity OK' : '✕ Antigravity Missing'}
        </div>
        <div className={`badge ${health.agent_dir_exists ? 'badge-green' : 'badge-red'}`}>
          {health.agent_dir_exists ? '● Agent Dir OK' : '✕ Agent Dir Missing'}
        </div>
      </div>

      {/* Stats grid */}
      <div className="stats-grid">
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

      {/* Quick info */}
      <div className="card" style={{ marginTop: '16px' }}>
        <div className="card-header">
          <span className="card-title">Quick Info</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
          <div style={{ color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>Machine:</span>
            {health.hostname}
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>OS:</span>
            {health.os}
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>Total Items:</span>
            {health.mcp_server_count + health.skill_count + health.workflow_count + health.knowledge_base_count + health.agent_count + health.hook_count}
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>Conversations:</span>
            {health.conversation_count} ({health.conversation_size_mb.toFixed(1)} MB)
          </div>
        </div>
      </div>
    </div>
  );
}
