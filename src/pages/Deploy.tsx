import { useState } from 'react';
import {
  Rocket, GitBranch, CheckCircle2, XCircle, Clock,
  ArrowRight, Package, Shield, TestTube2, FileCode,
  RefreshCw, ExternalLink
} from 'lucide-react';

// ============================================================
// Deploy — Release Pipeline View (gstack /ship inspired)
// ============================================================

interface PipelineStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: 'done' | 'active' | 'pending' | 'failed';
  detail: string;
  command?: string;
}

const demoRelease: PipelineStep[] = [
  { id: 'sync', label: 'Sync Main', icon: <RefreshCw size={14} />, status: 'done', detail: 'Merged 3 commits from main', command: 'git pull origin main' },
  { id: 'tests', label: 'Run Tests', icon: <TestTube2 size={14} />, status: 'done', detail: '42 tests passed, 0 failed', command: 'npm test' },
  { id: 'coverage', label: 'Coverage Audit', icon: <Shield size={14} />, status: 'done', detail: '87% coverage (target: 80%)', command: 'npm run coverage' },
  { id: 'lint', label: 'Lint & Type Check', icon: <FileCode size={14} />, status: 'done', detail: '0 errors, 0 warnings', command: 'tsc --noEmit && eslint .' },
  { id: 'build', label: 'Build', icon: <Package size={14} />, status: 'active', detail: 'Building production bundle...', command: 'npm run build' },
  { id: 'push', label: 'Push', icon: <ArrowRight size={14} />, status: 'pending', detail: 'Push to feature branch', command: 'git push origin feature/...' },
  { id: 'pr', label: 'Create PR', icon: <GitBranch size={14} />, status: 'pending', detail: 'Open pull request', command: 'gh pr create' },
  { id: 'merge', label: 'Merge', icon: <Rocket size={14} />, status: 'pending', detail: 'Merge to main', command: 'gh pr merge' },
];

function StepStatus({ status }: { status: string }) {
  switch (status) {
    case 'done': return <CheckCircle2 size={18} style={{ color: 'var(--status-green)' }} />;
    case 'active': return <RefreshCw size={18} style={{ color: 'var(--status-blue)', animation: 'spin 2s linear infinite' }} />;
    case 'failed': return <XCircle size={18} style={{ color: 'var(--status-red)' }} />;
    default: return <Clock size={18} style={{ color: 'var(--text-muted)' }} />;
  }
}

export default function Deploy() {
  const [pipeline] = useState(demoRelease);
  const [selectedProject, setSelectedProject] = useState('ag-tower');

  const progress = pipeline.filter(s => s.status === 'done').length;
  const total = pipeline.length;
  const pct = Math.round((progress / total) * 100);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Rocket size={22} style={{ color: 'var(--status-green)' }} />
              Deploy
            </h2>
            <p>Release pipeline · {progress}/{total} steps complete</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              style={{
                background: 'var(--bg-input)', border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-sm)', padding: '6px 12px',
                color: 'var(--text-primary)', fontSize: '12px',
                fontFamily: 'var(--font-mono)',
              }}
              value={selectedProject}
              onChange={e => setSelectedProject(e.target.value)}
            >
              <option value="ag-tower">ag-tower</option>
              <option value="appxdevkit">AppXDevKit</option>
            </select>
            <button className="btn btn-primary btn-sm">
              <Rocket size={14} /> Ship It
            </button>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        marginBottom: '24px',
        padding: '16px',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-primary)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600 }}>Release Progress</span>
          <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-accent)' }}>
            {pct}%
          </span>
        </div>
        <div style={{
          height: '6px', borderRadius: '3px',
          background: 'var(--bg-elevated)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: '3px',
            background: 'var(--accent-gradient)',
            width: `${pct}%`,
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Pipeline steps */}
      <div className="card" style={{ padding: 0 }}>
        {pipeline.map((step, i) => (
          <div key={step.id} style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            padding: '16px 20px',
            borderBottom: i < pipeline.length - 1 ? '1px solid var(--border-primary)' : 'none',
            background: step.status === 'active' ? 'rgba(59,130,246,0.06)' : 'transparent',
            transition: 'all var(--transition-fast)',
          }}>
            {/* Step number */}
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: step.status === 'done' ? 'rgba(16,185,129,0.15)' :
                step.status === 'active' ? 'rgba(59,130,246,0.15)' :
                  'var(--bg-elevated)',
              fontSize: '12px', fontWeight: 700,
              color: step.status === 'done' ? 'var(--status-green)' :
                step.status === 'active' ? 'var(--status-blue)' :
                  'var(--text-muted)',
              flexShrink: 0,
            }}>
              {i + 1}
            </div>

            {/* Status icon */}
            <StepStatus status={step.status} />

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{
                fontWeight: 600, fontSize: '13px',
                color: step.status === 'pending' ? 'var(--text-muted)' : 'var(--text-primary)',
              }}>
                {step.label}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {step.detail}
              </div>
            </div>

            {/* Command */}
            {step.command && (
              <code style={{
                fontSize: '10px', fontFamily: 'var(--font-mono)',
                color: 'var(--text-accent)',
                background: 'var(--bg-input)',
                padding: '4px 8px', borderRadius: 'var(--radius-sm)',
                maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {step.command}
              </code>
            )}

            {/* Connector line */}
            {step.status === 'done' && i < pipeline.length - 1 && (
              <div style={{
                position: 'absolute',
                left: '34px',
                top: '100%',
                width: '2px', height: '100%',
                background: 'var(--status-green)',
                opacity: 0.3,
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px', marginTop: '20px',
      }}>
        {[
          { label: 'Run Tests', icon: <TestTube2 size={16} />, color: 'var(--status-blue)' },
          { label: 'Build Release', icon: <Package size={16} />, color: 'var(--status-yellow)' },
          { label: 'Open GitHub', icon: <ExternalLink size={16} />, color: 'var(--text-accent)' },
        ].map(action => (
          <button key={action.label} className="card" style={{
            cursor: 'pointer', textAlign: 'center', padding: '20px',
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
              background: `${action.color}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 8px',
              color: action.color,
            }}>
              {action.icon}
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
