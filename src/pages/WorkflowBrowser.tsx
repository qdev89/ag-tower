import React, { useEffect, useState, useMemo } from 'react';
import { invoke } from '@tauri-apps/api/core';
import {
  Search, Globe, FolderGit2, Play, FileText,
  Lightbulb, ClipboardList, Hammer, SearchCheck, TestTube2,
  Rocket, BarChart3, Shield, BookOpen, ArrowRight
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ============================================================
// Workflow Browser — Premium workflow viewer with visual diagrams
// ============================================================

interface WorkflowInfo {
  name: string;
  filename: string;
  path: string;
  size_bytes: number;
  scope: string;
}

// Phase diagram data — extracted from wf-gstack or inferred from content
interface WorkflowPhase {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  gate: string;
}

const GSTACK_PHASES: WorkflowPhase[] = [
  { id: 'think',   label: 'Think',   icon: Lightbulb,     color: '#f59e0b', gate: 'DESIGN.md exists' },
  { id: 'plan',    label: 'Plan',    icon: ClipboardList, color: '#3b82f6', gate: 'Architecture locked' },
  { id: 'build',   label: 'Build',   icon: Hammer,        color: '#8b5cf6', gate: 'All tests pass' },
  { id: 'review',  label: 'Review',  icon: SearchCheck,   color: '#10b981', gate: 'Zero critical issues' },
  { id: 'test',    label: 'Test',    icon: TestTube2,     color: '#06b6d4', gate: 'Browser QA verified' },
  { id: 'ship',    label: 'Ship',    icon: Rocket,        color: '#ec4899', gate: 'PR merged' },
  { id: 'reflect', label: 'Reflect', icon: BarChart3,     color: '#64748b', gate: 'Retro written' },
];

// Detect workflow type and return phases
function detectWorkflowPhases(name: string, content: string): WorkflowPhase[] | null {
  const lower = name.toLowerCase() + ' ' + content.toLowerCase();
  
  // gstack workflow
  if (lower.includes('gstack') || lower.includes('think→plan→build')) {
    return GSTACK_PHASES;
  }
  
  // Brainstorm workflow
  if (lower.includes('brainstorm')) {
    return [
      { id: 'diverge',   label: 'Diverge',   icon: Lightbulb,     color: '#f59e0b', gate: 'Ideas generated' },
      { id: 'cluster',   label: 'Cluster',    icon: ClipboardList, color: '#3b82f6', gate: 'Themes identified' },
      { id: 'evaluate',  label: 'Evaluate',   icon: SearchCheck,   color: '#10b981', gate: 'Criteria scored' },
      { id: 'decide',    label: 'Decide',     icon: Rocket,        color: '#8b5cf6', gate: 'Decision made' },
    ];
  }
  
  // PM workflow
  if (lower.includes('product management') || lower.includes('backlog') || name.includes('wf-pm')) {
    return [
      { id: 'discover',  label: 'Discover',  icon: Search,        color: '#f59e0b', gate: 'Requirements clear' },
      { id: 'define',    label: 'Define',     icon: ClipboardList, color: '#3b82f6', gate: 'PRD approved' },
      { id: 'backlog',   label: 'Backlog',    icon: BookOpen,      color: '#8b5cf6', gate: 'Items prioritized' },
      { id: 'sprint',    label: 'Sprint',     icon: Hammer,        color: '#10b981', gate: 'Sprint complete' },
      { id: 'review',    label: 'Review',     icon: SearchCheck,   color: '#06b6d4', gate: 'Demo accepted' },
    ];
  }
  
  // Testing workflow
  if (lower.includes('testing') || lower.includes('qa') || name.includes('wf-test')) {
    return [
      { id: 'plan',     label: 'Plan',     icon: ClipboardList, color: '#3b82f6', gate: 'Test plan ready' },
      { id: 'prepare',  label: 'Prepare',  icon: Hammer,        color: '#8b5cf6', gate: 'Env configured' },
      { id: 'execute',  label: 'Execute',  icon: Play,          color: '#10b981', gate: 'Tests run' },
      { id: 'analyze',  label: 'Analyze',  icon: BarChart3,     color: '#f59e0b', gate: 'Results reviewed' },
      { id: 'report',   label: 'Report',   icon: FileText,      color: '#06b6d4', gate: 'Report delivered' },
    ];
  }
  
  // YOLO workflow
  if (lower.includes('yolo') || lower.includes('autonomous')) {
    return [
      { id: 'scan',    label: 'Scan',    icon: Search,      color: '#f59e0b', gate: 'Backlog scanned' },
      { id: 'execute', label: 'Execute', icon: Rocket,      color: '#ef4444', gate: 'Items completed' },
      { id: 'verify',  label: 'Verify',  icon: SearchCheck, color: '#10b981', gate: 'All verified' },
    ];
  }
  
  // Docs workflow
  if (lower.includes('documentation') || lower.includes('docs') || name.includes('wf-docs')) {
    return [
      { id: 'scan',     label: 'Scan',     icon: Search,    color: '#3b82f6', gate: 'Sources found' },
      { id: 'generate', label: 'Generate', icon: Hammer,    color: '#8b5cf6', gate: 'Docs generated' },
      { id: 'merge',    label: 'Merge',    icon: FileText,  color: '#10b981', gate: 'Master doc updated' },
      { id: 'commit',   label: 'Commit',   icon: Rocket,    color: '#f59e0b', gate: 'Git committed' },
    ];
  }
  
  // UI workflow
  if (lower.includes('ui/ux') || lower.includes('design intelligence') || name.includes('wf-ui')) {
    return [
      { id: 'analyze',  label: 'Analyze',  icon: Search,        color: '#f59e0b', gate: 'Requirements clear' },
      { id: 'design',   label: 'Design',   icon: ClipboardList, color: '#8b5cf6', gate: 'System generated' },
      { id: 'search',   label: 'Search',   icon: BookOpen,      color: '#3b82f6', gate: 'References found' },
      { id: 'build',    label: 'Build',    icon: Hammer,        color: '#10b981', gate: 'UI implemented' },
      { id: 'check',    label: 'Check',    icon: SearchCheck,   color: '#06b6d4', gate: 'Checklist passed' },
    ];
  }

  // machina workflow
  if (lower.includes('machina') || lower.includes('humaniz')) {
    return [
      { id: 'detect',  label: 'Detect',  icon: Search,      color: '#ef4444', gate: 'Patterns found' },
      { id: 'rewrite', label: 'Rewrite', icon: Hammer,      color: '#8b5cf6', gate: 'Text rewritten' },
      { id: 'score',   label: 'Score',   icon: BarChart3,   color: '#10b981', gate: 'Score ≥ 85' },
    ];
  }

  // Safety / security
  if (lower.includes('safety') || lower.includes('security') || lower.includes('guard')) {
    return [
      { id: 'scan',     label: 'Scan',     icon: Search,      color: '#f59e0b', gate: 'Threats identified' },
      { id: 'protect',  label: 'Protect',  icon: Shield,      color: '#ef4444', gate: 'Guards set' },
      { id: 'verify',   label: 'Verify',   icon: SearchCheck, color: '#10b981', gate: 'All clear' },
    ];
  }

  // Generic fallback for workflows with "phase" or numbered steps
  if (content.match(/## (Step|Phase) \d/i)) {
    return [
      { id: 'start',   label: 'Start',   icon: Play,        color: '#3b82f6', gate: 'Initialized' },
      { id: 'execute', label: 'Execute', icon: Hammer,      color: '#8b5cf6', gate: 'Steps complete' },
      { id: 'finish',  label: 'Finish',  icon: Rocket,      color: '#10b981', gate: 'Done' },
    ];
  }

  return null;
}

// ---- Visual Phase Diagram Component ----
function PhaseDiagram({ phases }: { phases: WorkflowPhase[] }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-primary)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      marginBottom: '16px',
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px',
      }}>
        Workflow Pipeline
      </div>

      {/* Horizontal flow */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0',
        overflowX: 'auto', paddingBottom: '8px',
      }}>
        {phases.map((phase, i) => {
          const Icon = phase.icon;
          return (
            <div key={phase.id} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '8px', minWidth: '100px',
              }}>
                {/* Phase circle */}
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: `${phase.color}18`,
                  border: `2px solid ${phase.color}50`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                }}>
                  <Icon size={18} style={{ color: phase.color }} />
                  {/* Phase number */}
                  <div style={{
                    position: 'absolute', top: '-4px', right: '-4px',
                    width: '16px', height: '16px', borderRadius: '50%',
                    background: phase.color, color: '#fff',
                    fontSize: '9px', fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {i + 1}
                  </div>
                </div>
                {/* Phase label */}
                <div style={{
                  fontSize: '11px', fontWeight: 700, color: phase.color,
                  textAlign: 'center',
                }}>
                  {phase.label}
                </div>
                {/* Gate */}
                <div style={{
                  fontSize: '9px', color: 'var(--text-muted)',
                  textAlign: 'center', lineHeight: '1.3',
                  maxWidth: '90px',
                }}>
                  ⛔ {phase.gate}
                </div>
              </div>

              {/* Connector arrow */}
              {i < phases.length - 1 && (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  margin: '0 4px', marginBottom: '40px',
                }}>
                  <div style={{
                    width: '28px', height: '2px',
                    background: `linear-gradient(90deg, ${phase.color}60, ${phases[i + 1].color}60)`,
                  }} />
                  <ArrowRight size={10} style={{
                    color: 'var(--text-muted)', marginTop: '-6px',
                  }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Simple markdown renderer for workflow content ----
function WorkflowContentRenderer({ content }: { content: string }) {
  const rendered = useMemo(() => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCode = false;
    let codeBlock: string[] = [];
    let codeKey = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code blocks
      if (line.startsWith('```')) {
        if (inCode) {
          elements.push(
            <pre key={`code-${codeKey++}`} style={{
              background: 'var(--bg-secondary)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.6',
              margin: '8px 0',
              overflowX: 'auto',
            }}>
              {codeBlock.join('\n')}
            </pre>
          );
          codeBlock = [];
          inCode = false;
        } else {
          inCode = true;
        }
        continue;
      }
      if (inCode) { codeBlock.push(line); continue; }

      // Headers
      if (line.startsWith('# ')) {
        elements.push(
          <h2 key={i} style={{
            fontSize: '20px', fontWeight: 800, marginTop: '24px', marginBottom: '8px',
            color: 'var(--text-primary)',
            borderBottom: '1px solid var(--border-primary)',
            paddingBottom: '8px',
          }}>{line.replace(/^# /, '')}</h2>
        );
        continue;
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h3 key={i} style={{
            fontSize: '16px', fontWeight: 700, marginTop: '20px', marginBottom: '6px',
            color: 'var(--text-accent)',
          }}>{line.replace(/^## /, '')}</h3>
        );
        continue;
      }
      if (line.startsWith('### ')) {
        elements.push(
          <h4 key={i} style={{
            fontSize: '13px', fontWeight: 700, marginTop: '16px', marginBottom: '4px',
            color: 'var(--text-secondary)',
          }}>{line.replace(/^### /, '')}</h4>
        );
        continue;
      }

      // Horizontal rule
      if (line.match(/^---+$/)) {
        elements.push(
          <hr key={i} style={{ border: 'none', borderTop: '1px solid var(--border-primary)', margin: '16px 0' }} />
        );
        continue;
      }

      // Blockquotes
      if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={i} style={{
            borderLeft: '3px solid var(--accent-primary)',
            paddingLeft: '12px',
            margin: '8px 0',
            color: 'var(--text-secondary)',
            fontSize: '12px',
            fontStyle: 'italic',
          }}>{line.replace(/^> /, '')}</blockquote>
        );
        continue;
      }

      // Bullet points
      if (line.match(/^[-*] /)) {
        elements.push(
          <div key={i} style={{
            display: 'flex', gap: '8px', padding: '2px 0', fontSize: '13px',
            color: 'var(--text-secondary)', lineHeight: '1.5',
          }}>
            <span style={{ color: 'var(--accent-primary)', flexShrink: 0 }}>•</span>
            <span>{line.replace(/^[-*] /, '')}</span>
          </div>
        );
        continue;
      }

      // Numbered lists
      if (line.match(/^\d+\. /)) {
        const num = line.match(/^(\d+)\./)?.[1] || '1';
        elements.push(
          <div key={i} style={{
            display: 'flex', gap: '8px', padding: '2px 0', fontSize: '13px',
            color: 'var(--text-secondary)', lineHeight: '1.5',
          }}>
            <span style={{
              color: 'var(--accent-primary)', fontWeight: 700,
              fontSize: '11px', fontFamily: 'var(--font-mono)',
              minWidth: '18px',
            }}>{num}.</span>
            <span>{line.replace(/^\d+\. /, '')}</span>
          </div>
        );
        continue;
      }

      // Checkbox
      if (line.match(/^- \[[ x]\]/)) {
        const checked = line.includes('[x]');
        elements.push(
          <div key={i} style={{
            display: 'flex', gap: '8px', padding: '2px 0', fontSize: '13px',
            color: checked ? 'var(--status-green)' : 'var(--text-secondary)',
            lineHeight: '1.5',
          }}>
            <span>{checked ? '☑' : '☐'}</span>
            <span style={{ textDecoration: checked ? 'line-through' : 'none', opacity: checked ? 0.6 : 1 }}>
              {line.replace(/^- \[[ x]\] /, '')}
            </span>
          </div>
        );
        continue;
      }

      // Empty lines
      if (!line.trim()) {
        elements.push(<div key={i} style={{ height: '8px' }} />);
        continue;
      }

      // Turbo annotations — highlight
      if (line.includes('// turbo')) {
        elements.push(
          <div key={i} style={{
            fontSize: '11px', fontFamily: 'var(--font-mono)',
            color: '#f59e0b', background: 'rgba(245,158,11,0.08)',
            padding: '4px 10px', borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(245,158,11,0.2)',
            margin: '4px 0',
          }}>
            ⚡ {line.trim()}
          </div>
        );
        continue;
      }

      // Regular paragraph
      elements.push(
        <p key={i} style={{
          fontSize: '13px', color: 'var(--text-secondary)',
          lineHeight: '1.6', margin: '2px 0',
        }}>{line}</p>
      );
    }

    return elements;
  }, [content]);

  return <div>{rendered}</div>;
}

export default function WorkflowBrowser() {
  const [workflows, setWorkflows] = useState<WorkflowInfo[]>([]);
  const [selected, setSelected] = useState<WorkflowInfo | null>(null);
  const [content, setContent] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'visual' | 'raw'>('visual');

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const data = await invoke<WorkflowInfo[]>('list_workflows');
      setWorkflows(data);
      if (data.length > 0) {
        selectWorkflow(data[0]);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const selectWorkflow = async (wf: WorkflowInfo) => {
    setSelected(wf);
    try {
      const data = await invoke<string>('get_workflow_content', {
        name: wf.filename,
        scope: wf.scope,
      });
      setContent(data);
    } catch {
      setContent('Error loading workflow content');
    }
  };

  const filtered = workflows.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase())
  );

  // Detect workflow phases for diagram
  const phases = selected ? detectWorkflowPhases(selected.name, content) : null;

  if (loading) {
    return <div className="loading"><div className="spinner" /> Loading workflows...</div>;
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Play size={20} style={{ color: 'var(--accent-primary)' }} />
              Workflows
            </h2>
            <p>{workflows.length} workflows available · {filtered.length} shown</p>
          </div>
          {selected && (
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                className={`btn btn-sm ${viewMode === 'visual' ? 'btn-primary' : ''}`}
                onClick={() => setViewMode('visual')}
              >
                Visual
              </button>
              <button
                className={`btn btn-sm ${viewMode === 'raw' ? 'btn-primary' : ''}`}
                onClick={() => setViewMode('raw')}
              >
                Raw
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="split-layout">
        {/* Left: Workflow list */}
        <div className="split-list">
          <div style={{ padding: '12px' }}>
            <div className="search-input">
              <Search size={14} style={{ color: 'var(--text-muted)' }} />
              <input
                placeholder="Filter workflows..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="data-list">
            {filtered.map(wf => (
              <button
                key={wf.path}
                className={`data-list-item ${selected?.path === wf.path ? 'active' : ''}`}
                onClick={() => selectWorkflow(wf)}
              >
                {wf.scope === 'global' ? (
                  <Globe size={14} style={{ color: 'var(--status-blue)' }} />
                ) : (
                  <FolderGit2 size={14} style={{ color: 'var(--status-green)' }} />
                )}
                <span className="data-list-name">{wf.name}</span>
                <span className="data-list-meta">
                  {(wf.size_bytes / 1024).toFixed(1)}k
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Workflow detail */}
        <div className="split-detail">
          {selected ? (
            <div className="slide-in">
              {/* Header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px',
                flexWrap: 'wrap',
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{selected.name}</h3>
                <span className={`badge ${selected.scope === 'global' ? 'badge-blue' : 'badge-green'}`}>
                  {selected.scope}
                </span>
                <span style={{
                  fontSize: '10px', fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)', marginLeft: 'auto',
                }}>
                  {(selected.size_bytes / 1024).toFixed(1)} KB · {selected.filename}
                </span>
              </div>

              {/* Phase diagram (if detected) */}
              {phases && viewMode === 'visual' && (
                <PhaseDiagram phases={phases} />
              )}

              {/* Content */}
              {viewMode === 'visual' ? (
                <div style={{
                  maxHeight: phases ? 'calc(100vh - 420px)' : 'calc(100vh - 280px)',
                  overflow: 'auto',
                  paddingRight: '8px',
                }}>
                  <WorkflowContentRenderer content={content} />
                </div>
              ) : (
                <pre style={{
                  background: 'var(--bg-input)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-primary)',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6',
                  maxHeight: 'calc(100vh - 280px)',
                  overflow: 'auto',
                }}>
                  {content}
                </pre>
              )}
            </div>
          ) : (
            <div className="empty-state"><p>Select a workflow</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
