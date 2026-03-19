import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Search, Globe, FolderGit2 } from 'lucide-react';

interface WorkflowInfo {
  name: string;
  filename: string;
  path: string;
  size_bytes: number;
  scope: string;
}

export default function WorkflowBrowser() {
  const [workflows, setWorkflows] = useState<WorkflowInfo[]>([]);
  const [selected, setSelected] = useState<WorkflowInfo | null>(null);
  const [content, setContent] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="loading"><div className="spinner" /> Loading workflows...</div>;
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Workflows</h2>
        <p>{workflows.length} workflows available</p>
      </div>

      <div className="split-layout">
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
        <div className="split-detail">
          {selected ? (
            <div className="slide-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{selected.name}</h3>
                <span className={`badge ${selected.scope === 'global' ? 'badge-blue' : 'badge-green'}`}>
                  {selected.scope}
                </span>
              </div>
              <pre style={{
                background: 'var(--bg-input)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-primary)',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.6',
                maxHeight: 'calc(100vh - 280px)',
                overflow: 'auto',
              }}>
                {content}
              </pre>
            </div>
          ) : (
            <div className="empty-state"><p>Select a workflow</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
