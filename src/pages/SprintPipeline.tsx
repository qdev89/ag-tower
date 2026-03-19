import { useState, useCallback } from 'react';
import {
  Lightbulb, ClipboardList, Hammer, SearchCheck,
  TestTube2, Rocket, BarChart3, ChevronRight,
  Plus, Play, Pause, CheckCircle2, Clock, AlertTriangle,
  Zap, GripVertical, Users, GitBranch as BranchIcon
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { showToast } from '../components/Toast';

// ============================================================
// Sprint Pipeline v2 — Interactive, with drag-and-drop & multi-lane
// ============================================================

interface SprintTask {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'active' | 'done' | 'blocked';
  elapsed?: string;
  agent?: string;
  branch?: string;
  lane?: number; // For parallel sprint: which concurrent lane
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

// Demo data
const initialPipeline: PipelineStage[] = [
  {
    id: 'think', label: 'Think', icon: Lightbulb, color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    description: 'Reframe the problem before coding',
    gstackCommand: '/office-hours',
    tasks: [
      { id: 't1', name: 'Auth System Redesign', description: 'Reframing authentication flow', status: 'done', elapsed: '12m', agent: 'YC Partner' },
    ],
  },
  {
    id: 'plan', label: 'Plan', icon: ClipboardList, color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    description: 'Lock architecture & review scope',
    gstackCommand: '/plan-ceo-review + /plan-eng-review',
    tasks: [
      { id: 'p1', name: 'Auth System Redesign', description: 'CEO + Eng review passed', status: 'done', elapsed: '8m', agent: 'CEO + Eng Manager' },
      { id: 'p2', name: 'Dashboard Analytics', description: 'Awaiting CEO review', status: 'active', elapsed: '3m', agent: 'CEO', lane: 1 },
    ],
  },
  {
    id: 'build', label: 'Build', icon: Hammer, color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    description: 'Implement the feature',
    gstackCommand: 'Code implementation',
    tasks: [
      { id: 'b1', name: 'Auth System Redesign', description: '11 files, 2,400 LOC', status: 'active', elapsed: '18m', agent: 'Builder Agent 1', branch: 'feature/auth-redesign', lane: 0 },
      { id: 'b2', name: 'API Rate Limiter', description: '3 files, 450 LOC', status: 'active', elapsed: '6m', agent: 'Builder Agent 2', branch: 'feature/rate-limiter', lane: 1 },
    ],
  },
  {
    id: 'review', label: 'Review', icon: SearchCheck, color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    description: 'Staff engineer code review',
    gstackCommand: '/review',
    tasks: [
      { id: 'r1', name: 'Nav Fix', description: '2 auto-fixed, 1 pending', status: 'active', elapsed: '5m', agent: 'Staff Engineer', branch: 'fix/nav-crash' },
    ],
  },
  {
    id: 'test', label: 'Test', icon: TestTube2, color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    description: 'QA with real browser testing',
    gstackCommand: '/qa',
    tasks: [],
  },
  {
    id: 'ship', label: 'Ship', icon: Rocket, color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    description: 'Tests → Push → PR → Merge',
    gstackCommand: '/ship',
    tasks: [
      { id: 's1', name: 'Settings Page', description: 'PR #42 — ready to merge', status: 'done', agent: 'Release Eng', branch: 'feature/settings' },
    ],
  },
  {
    id: 'reflect', label: 'Reflect', icon: BarChart3, color: '#64748b',
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

function TaskCard({ task, stageColor, onDragStart }: {
  task: SprintTask;
  stageColor: string;
  onDragStart: (taskId: string) => void;
}) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(task.id)}
      style={{
        background: 'var(--bg-secondary)',
        border: `1px solid ${task.status === 'active' ? 'var(--border-accent)' : 'var(--border-primary)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '12px',
        transition: 'all var(--transition-fast)',
        cursor: 'grab',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {task.status === 'active' && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: `linear-gradient(90deg, ${stageColor}, ${stageColor}80)`,
          animation: 'pulse 2s ease-in-out infinite',
        }} />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
        <GripVertical size={10} style={{ color: 'var(--text-muted)', cursor: 'grab', flexShrink: 0 }} />
        <StatusIcon status={task.status} />
        <span style={{ fontWeight: 600, fontSize: '12px', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {task.name}
        </span>
        {task.elapsed && (
          <span style={{
            fontSize: '10px', fontFamily: 'var(--font-mono)',
            color: task.status === 'active' ? 'var(--status-blue)' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0,
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
        {task.lane !== undefined && (
          <span style={{
            fontSize: '10px', background: 'rgba(245,158,11,0.12)', color: '#f59e0b',
            padding: '2px 8px', borderRadius: '10px',
          }}>
            Lane {task.lane + 1}
          </span>
        )}
      </div>
    </div>
  );
}

// Parallel Sprint Visualization — multi-lane view
function ParallelView({ pipeline }: { pipeline: PipelineStage[] }) {
  // Find all tasks with lane assignments
  const lanes: Map<number, { task: SprintTask; stageId: string; stageColor: string }[]> = new Map();
  pipeline.forEach(stage => {
    stage.tasks.forEach(task => {
      const lane = task.lane ?? 0;
      if (!lanes.has(lane)) lanes.set(lane, []);
      lanes.get(lane)!.push({ task, stageId: stage.id, stageColor: stage.color });
    });
  });

  const laneEntries = Array.from(lanes.entries()).sort((a, b) => a[0] - b[0]);
  if (laneEntries.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '40px' }}>
        <Users size={32} style={{ opacity: 0.3 }} />
        <p>No parallel tasks running</p>
        <p style={{ fontSize: '12px' }}>Assign tasks to lanes to see concurrent agent execution</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {laneEntries.map(([laneNum, items]) => (
        <div key={laneNum} style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-lg)', padding: '16px',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px',
          }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: 'rgba(245,158,11,0.15)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Users size={12} style={{ color: '#f59e0b' }} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700 }}>Lane {laneNum + 1}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {items.length} task{items.length > 1 ? 's' : ''}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {items.map(({ task, stageId, stageColor }) => (
              <div key={task.id} style={{ flex: '1 1 220px', minWidth: '220px' }}>
                <div style={{
                  fontSize: '9px', fontWeight: 700, color: stageColor,
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                  marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  <BranchIcon size={10} /> {stageId}
                </div>
                <TaskCard task={task} stageColor={stageColor} onDragStart={() => {}} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Readiness Dashboard
function ReadinessView({ pipeline: _pipeline }: { pipeline: PipelineStage[] }) {
  const features = [
    {
      name: 'Auth System Redesign',
      branch: 'feature/auth-redesign',
      gates: [
        { label: 'Office Hours', icon: '💡', status: 'passed' as const, detail: 'Reframed as "personal auth gateway"' },
        { label: 'CEO Review', icon: '👔', status: 'passed' as const, detail: 'Scope approved' },
        { label: 'Eng Review', icon: '⚙️', status: 'passed' as const, detail: '3 concerns resolved' },
        { label: 'Design Review', icon: '🎨', status: 'pending' as const, detail: 'Not started' },
        { label: 'Code Review', icon: '🔍', status: 'active' as const, detail: '2 auto-fixed, 1 pending' },
        { label: 'QA', icon: '🧪', status: 'blocked' as const, detail: 'Blocked by Code Review' },
        { label: 'Ship', icon: '🚀', status: 'blocked' as const, detail: 'Blocked by QA' },
      ],
    },
    {
      name: 'Settings Page',
      branch: 'feature/settings',
      shipped: true,
      gates: [
        { label: 'Office Hours', icon: '💡', status: 'passed' as const },
        { label: 'CEO Review', icon: '👔', status: 'passed' as const },
        { label: 'Eng Review', icon: '⚙️', status: 'passed' as const },
        { label: 'Code Review', icon: '🔍', status: 'passed' as const },
        { label: 'QA', icon: '🧪', status: 'passed' as const },
        { label: 'Ship', icon: '🚀', status: 'passed' as const },
      ],
    },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Review Readiness Dashboard</span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Tracks review gates per feature
        </span>
      </div>
      {features.map(feature => (
        <div key={feature.name} style={{
          padding: '16px', background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)',
          marginBottom: '12px',
          opacity: feature.shipped ? 0.6 : 1,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontWeight: 700, fontSize: '14px' }}>{feature.name}</span>
            <span style={{
              fontSize: '10px', fontFamily: 'var(--font-mono)',
              background: 'rgba(16,185,129,0.12)', color: 'var(--status-green)',
              padding: '2px 8px', borderRadius: '10px',
            }}>
              ⎇ {feature.branch}
            </span>
            {feature.shipped && (
              <span className="badge badge-green" style={{ marginLeft: 'auto' }}>🎉 Shipped</span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {feature.gates.map((gate, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                background: gate.status === 'active' ? 'rgba(59,130,246,0.08)' : 'transparent',
              }}>
                <span style={{ fontSize: '14px', width: '22px', textAlign: 'center' }}>{gate.icon}</span>
                <span style={{ fontWeight: 500, fontSize: '13px', width: '120px' }}>{gate.label}</span>
                <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
                {gate.status === 'passed' && <span className="badge badge-green">✓ Passed</span>}
                {gate.status === 'active' && <span className="badge badge-blue" style={{ animation: 'pulse 2s ease-in-out infinite' }}>● Active</span>}
                {gate.status === 'pending' && <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>○ Pending</span>}
                {gate.status === 'blocked' && <span className="badge badge-red">⊘ Blocked</span>}
                {'detail' in gate && gate.detail && (
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    {gate.detail}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SprintPipeline() {
  const [pipeline, setPipeline] = useState<PipelineStage[]>(initialPipeline);
  const [activeView, setActiveView] = useState<'pipeline' | 'parallel' | 'readiness'>('pipeline');
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  const totalTasks = pipeline.reduce((sum, s) => sum + s.tasks.length, 0);
  const activeTasks = pipeline.reduce((sum, s) => sum + s.tasks.filter(t => t.status === 'active').length, 0);
  const doneTasks = pipeline.reduce((sum, s) => sum + s.tasks.filter(t => t.status === 'done').length, 0);

  // Handle drop — move task to a different stage
  const handleDrop = useCallback((targetStageId: string) => {
    if (!draggedTask) return;
    setPipeline(prev => {
      const next = prev.map(s => ({
        ...s,
        tasks: s.tasks.filter(t => t.id !== draggedTask),
      }));
      // Find the task
      let task: SprintTask | null = null;
      for (const s of prev) {
        const found = s.tasks.find(t => t.id === draggedTask);
        if (found) { task = found; break; }
      }
      if (!task) return prev;
      // Add to target
      return next.map(s => s.id === targetStageId ? { ...s, tasks: [...s.tasks, task!] } : s);
    });
    setDraggedTask(null);
    showToast('success', 'Task moved successfully');
  }, [draggedTask]);

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
            {(['pipeline', 'parallel', 'readiness'] as const).map(view => (
              <button
                key={view}
                className={`btn btn-sm ${activeView === view ? 'btn-primary' : ''}`}
                onClick={() => setActiveView(view)}
              >
                {view === 'pipeline' ? 'Pipeline' : view === 'parallel' ? 'Parallel' : 'Readiness'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline flow indicator */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        marginBottom: '24px', padding: '12px 16px',
        background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-primary)', overflowX: 'auto',
      }}>
        {pipeline.map((stage, i) => {
          const Icon = stage.icon;
          const taskCount = stage.tasks.length;
          const hasActive = stage.tasks.some(t => t.status === 'active');
          return (
            <div key={stage.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 14px', borderRadius: 'var(--radius-sm)',
                background: hasActive ? `${stage.color}15` : 'transparent',
                border: hasActive ? `1px solid ${stage.color}30` : '1px solid transparent',
                transition: 'all var(--transition-fast)', minWidth: 'fit-content',
              }}>
                <Icon size={16} style={{ color: stage.color }} />
                <span style={{ fontSize: '12px', fontWeight: 600, color: hasActive ? stage.color : 'var(--text-secondary)' }}>
                  {stage.label}
                </span>
                {taskCount > 0 && (
                  <span style={{
                    fontSize: '10px', fontWeight: 700, background: stage.gradient, color: 'white',
                    width: '18px', height: '18px', borderRadius: '50%',
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
          gap: '8px', overflowX: 'auto', paddingBottom: '16px',
        }}>
          {pipeline.map(stage => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.id}
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleDrop(stage.id)}
                style={{ display: 'flex', flexDirection: 'column', minWidth: '180px' }}
              >
                {/* Stage header */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '12px', marginBottom: '8px',
                  borderRadius: 'var(--radius-md)', background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)',
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: 'var(--radius-sm)',
                    background: stage.gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
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
                    <TaskCard
                      key={task.id}
                      task={task}
                      stageColor={stage.color}
                      onDragStart={setDraggedTask}
                    />
                  ))}

                  {/* Add task button */}
                  <button style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '10px', border: '1px dashed var(--border-primary)',
                    borderRadius: 'var(--radius-md)', background: 'transparent',
                    color: 'var(--text-muted)', fontSize: '11px', cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = stage.color; e.currentTarget.style.color = stage.color; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    <Plus size={12} /> Add Task
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : activeView === 'parallel' ? (
        <ParallelView pipeline={pipeline} />
      ) : (
        <ReadinessView pipeline={pipeline} />
      )}
    </div>
  );
}
