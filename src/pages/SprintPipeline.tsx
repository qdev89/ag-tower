import { useState } from 'react';
import {
  Lightbulb, ClipboardList, Hammer, SearchCheck,
  TestTube2, Rocket, BarChart3, ChevronRight,
  Plus, Play, Pause, CheckCircle2, Clock, AlertTriangle,
  ArrowRight, Zap
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ============================================================
// Sprint Pipeline — Inspired by gstack's Think→Plan→Build→Review→Test→Ship→Reflect
// ============================================================

interface SprintTask {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'active' | 'done' | 'blocked';
  elapsed?: string;
  agent?: string;
  branch?: string;
}

interface PipelineStage {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  gradient: string;
  description: string;
  gstackCommand: string;
  tasks: SprintTask[];
}

// Demo data showing a realistic sprint
const initialPipeline: PipelineStage[] = [
  {
    id: 'think',
    label: 'Think',
    icon: Lightbulb,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    description: 'Reframe the problem before coding',
    gstackCommand: '/office-hours',
    tasks: [
      { id: 't1', name: 'Auth System Redesign', description: 'Reframing authentication flow', status: 'done', elapsed: '12m', agent: 'YC Partner' },
    ],
  },
  {
    id: 'plan',
    label: 'Plan',
    icon: ClipboardList,
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    description: 'Lock architecture & review scope',
    gstackCommand: '/plan-ceo-review + /plan-eng-review',
    tasks: [
      { id: 'p1', name: 'Auth System Redesign', description: 'CEO + Eng review passed', status: 'done', elapsed: '8m', agent: 'CEO + Eng Manager' },
      { id: 'p2', name: 'Dashboard Analytics', description: 'Awaiting CEO review', status: 'active', elapsed: '3m', agent: 'CEO' },
    ],
  },
  {
    id: 'build',
    label: 'Build',
    icon: Hammer,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    description: 'Implement the feature',
    gstackCommand: 'Code implementation',
    tasks: [
      { id: 'b1', name: 'Auth System Redesign', description: '11 files, 2,400 LOC', status: 'active', elapsed: '18m', agent: 'Builder', branch: 'feature/auth-redesign' },
    ],
  },
  {
    id: 'review',
    label: 'Review',
    icon: SearchCheck,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    description: 'Staff engineer code review',
    gstackCommand: '/review',
    tasks: [
      { id: 'r1', name: 'Nav Fix', description: '2 auto-fixed, 1 pending', status: 'active', elapsed: '5m', agent: 'Staff Engineer', branch: 'fix/nav-crash' },
    ],
  },
  {
    id: 'test',
    label: 'Test',
    icon: TestTube2,
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    description: 'QA with real browser testing',
    gstackCommand: '/qa',
    tasks: [],
  },
  {
    id: 'ship',
    label: 'Ship',
    icon: Rocket,
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    description: 'Tests → Push → PR → Merge',
    gstackCommand: '/ship',
    tasks: [
      { id: 's1', name: 'Settings Page', description: 'PR #42 — ready to merge', status: 'done', agent: 'Release Eng', branch: 'feature/settings' },
    ],
  },
  {
    id: 'reflect',
    label: 'Reflect',
    icon: BarChart3,
    color: '#64748b',
    gradient: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
    description: 'Retro with per-person stats',
    gstackCommand: '/retro',
    tasks: [],
  },
];

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'done': return <CheckCircle2 size={14} style={{ color: 'var(--status-green)' }} />;
    case 'active': return <Play size={14} style={{ color: 'var(--status-blue)' }} />;
    case 'blocked': return <AlertTriangle size={14} style={{ color: 'var(--status-red)' }} />;
    default: return <Pause size={14} style={{ color: 'var(--text-muted)' }} />;
  }
}

function TaskCard({ task }: { task: SprintTask }) {
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: `1px solid ${task.status === 'active' ? 'var(--border-accent)' : 'var(--border-primary)'}`,
      borderRadius: 'var(--radius-md)',
      padding: '12px',
      transition: 'all var(--transition-fast)',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {task.status === 'active' && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'var(--accent-gradient)',
          animation: 'pulse 2s ease-in-out infinite',
        }} />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <StatusIcon status={task.status} />
        <span style={{ fontWeight: 600, fontSize: '12px', flex: 1 }}>{task.name}</span>
        {task.elapsed && (
          <span style={{
            fontSize: '10px', fontFamily: 'var(--font-mono)',
            color: task.status === 'active' ? 'var(--status-blue)' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: '3px',
          }}>
            <Clock size={10} /> {task.elapsed}
          </span>
        )}
      </div>
      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
        {task.description}
      </p>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {task.agent && (
          <span style={{
            fontSize: '10px', background: 'rgba(102,126,234,0.12)', color: 'var(--text-accent)',
            padding: '2px 8px', borderRadius: '10px',
          }}>
            🤖 {task.agent}
          </span>
        )}
        {task.branch && (
          <span style={{
            fontSize: '10px', background: 'rgba(16,185,129,0.12)', color: 'var(--status-green)',
            padding: '2px 8px', borderRadius: '10px', fontFamily: 'var(--font-mono)',
          }}>
            ⎇ {task.branch}
          </span>
        )}
      </div>
    </div>
  );
}

export default function SprintPipeline() {
  const [pipeline] = useState<PipelineStage[]>(initialPipeline);
  const [activeView, setActiveView] = useState<'pipeline' | 'readiness'>('pipeline');

  const totalTasks = pipeline.reduce((sum, s) => sum + s.tasks.length, 0);
  const activeTasks = pipeline.reduce((sum, s) => sum + s.tasks.filter(t => t.status === 'active').length, 0);
  const doneTasks = pipeline.reduce((sum, s) => sum + s.tasks.filter(t => t.status === 'done').length, 0);

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Zap size={22} style={{ color: 'var(--accent-primary)' }} />
              Sprint Pipeline
            </h2>
            <p>
              {totalTasks} tasks · {activeTasks} active · {doneTasks} completed ·
              <span style={{ color: 'var(--text-accent)', marginLeft: '4px' }}>
                Inspired by gstack
              </span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              className={`btn btn-sm ${activeView === 'pipeline' ? 'btn-primary' : ''}`}
              onClick={() => setActiveView('pipeline')}
            >
              Pipeline
            </button>
            <button
              className={`btn btn-sm ${activeView === 'readiness' ? 'btn-primary' : ''}`}
              onClick={() => setActiveView('readiness')}
            >
              Readiness
            </button>
          </div>
        </div>
      </div>

      {/* Pipeline flow indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        marginBottom: '24px',
        padding: '12px 16px',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-primary)',
        overflowX: 'auto',
      }}>
        {pipeline.map((stage, i) => {
          const Icon = stage.icon;
          const taskCount = stage.tasks.length;
          const hasActive = stage.tasks.some(t => t.status === 'active');
          return (
            <div key={stage.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                background: hasActive ? `${stage.color}15` : 'transparent',
                border: hasActive ? `1px solid ${stage.color}30` : '1px solid transparent',
                transition: 'all var(--transition-fast)',
                minWidth: 'fit-content',
              }}>
                <Icon size={16} style={{ color: stage.color }} />
                <span style={{
                  fontSize: '12px', fontWeight: 600,
                  color: hasActive ? stage.color : 'var(--text-secondary)',
                }}>
                  {stage.label}
                </span>
                {taskCount > 0 && (
                  <span style={{
                    fontSize: '10px', fontWeight: 700,
                    background: stage.gradient,
                    color: 'white',
                    width: '18px', height: '18px',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {taskCount}
                  </span>
                )}
              </div>
              {i < pipeline.length - 1 && (
                <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              )}
            </div>
          );
        })}
      </div>

      {activeView === 'pipeline' ? (
        /* Pipeline Columns */
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${pipeline.length}, minmax(180px, 1fr))`,
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '16px',
        }}>
          {pipeline.map(stage => {
            const Icon = stage.icon;
            return (
              <div key={stage.id} style={{
                display: 'flex',
                flexDirection: 'column',
                minWidth: '180px',
              }}>
                {/* Stage header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  marginBottom: '8px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)',
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: 'var(--radius-sm)',
                    background: stage.gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={14} style={{ color: 'white' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 700 }}>{stage.label}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {stage.gstackCommand}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '11px', fontWeight: 600,
                    color: stage.tasks.length > 0 ? stage.color : 'var(--text-muted)',
                  }}>
                    {stage.tasks.length}
                  </span>
                </div>

                {/* Task cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  {stage.tasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}

                  {/* Add task button */}
                  <button style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '10px',
                    border: '1px dashed var(--border-primary)',
                    borderRadius: 'var(--radius-md)',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    fontSize: '11px',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = stage.color;
                      e.currentTarget.style.color = stage.color;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                      e.currentTarget.style.color = 'var(--text-muted)';
                    }}
                  >
                    <Plus size={12} /> Add Task
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Readiness Dashboard — Review gates per feature */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Review Readiness Dashboard</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Tracks review gates per feature
              </span>
            </div>

            {/* Feature: Auth System Redesign */}
            <div style={{
              padding: '16px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-primary)',
              marginBottom: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span style={{ fontWeight: 700, fontSize: '14px' }}>Auth System Redesign</span>
                <span style={{
                  fontSize: '10px', fontFamily: 'var(--font-mono)',
                  background: 'rgba(16,185,129,0.12)', color: 'var(--status-green)',
                  padding: '2px 8px', borderRadius: '10px',
                }}>
                  ⎇ feature/auth-redesign
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { label: 'Office Hours', icon: '💡', status: 'passed', detail: 'Reframed as "personal auth gateway"' },
                  { label: 'CEO Review', icon: '👔', status: 'passed', detail: 'Scope approved — selective expansion' },
                  { label: 'Eng Review', icon: '⚙️', status: 'passed', detail: '3 concerns resolved' },
                  { label: 'Design Review', icon: '🎨', status: 'pending', detail: 'Not started' },
                  { label: 'Code Review', icon: '🔍', status: 'active', detail: '2 auto-fixed, 1 pending' },
                  { label: 'QA', icon: '🧪', status: 'blocked', detail: 'Blocked by Code Review' },
                  { label: 'Ship', icon: '🚀', status: 'blocked', detail: 'Blocked by QA' },
                ].map((gate, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: gate.status === 'active' ? 'rgba(59,130,246,0.08)' : 'transparent',
                  }}>
                    <span style={{ fontSize: '14px', width: '22px', textAlign: 'center' }}>{gate.icon}</span>
                    <span style={{ fontWeight: 500, fontSize: '13px', width: '120px' }}>{gate.label}</span>
                    <ArrowRight size={12} style={{ color: 'var(--text-muted)' }} />
                    {gate.status === 'passed' && (
                      <span className="badge badge-green">✓ Passed</span>
                    )}
                    {gate.status === 'active' && (
                      <span className="badge badge-blue" style={{ animation: 'pulse 2s ease-in-out infinite' }}>● Active</span>
                    )}
                    {gate.status === 'pending' && (
                      <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>○ Pending</span>
                    )}
                    {gate.status === 'blocked' && (
                      <span className="badge badge-red">⊘ Blocked</span>
                    )}
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                      {gate.detail}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature: Settings Page */}
            <div style={{
              padding: '16px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-primary)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span style={{ fontWeight: 700, fontSize: '14px' }}>Settings Page</span>
                <span style={{
                  fontSize: '10px', fontFamily: 'var(--font-mono)',
                  background: 'rgba(16,185,129,0.12)', color: 'var(--status-green)',
                  padding: '2px 8px', borderRadius: '10px',
                }}>
                  ⎇ feature/settings
                </span>
                <span className="badge badge-green" style={{ marginLeft: 'auto' }}>🎉 Shipped</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { label: 'Office Hours', icon: '💡', status: 'passed' },
                  { label: 'CEO Review', icon: '👔', status: 'passed' },
                  { label: 'Eng Review', icon: '⚙️', status: 'passed' },
                  { label: 'Code Review', icon: '🔍', status: 'passed' },
                  { label: 'QA', icon: '🧪', status: 'passed' },
                  { label: 'Ship', icon: '🚀', status: 'passed' },
                ].map((gate, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    opacity: 0.7,
                  }}>
                    <span style={{ fontSize: '14px', width: '22px', textAlign: 'center' }}>{gate.icon}</span>
                    <span style={{ fontWeight: 500, fontSize: '13px', width: '120px' }}>{gate.label}</span>
                    <ArrowRight size={12} style={{ color: 'var(--text-muted)' }} />
                    <span className="badge badge-green">✓ Passed</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
