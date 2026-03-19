import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Webhook, Search, X, Code2, FolderOpen } from 'lucide-react';

interface HookInfo {
  name: string;
  path: string;
  size_bytes: number;
}

function getHookType(name: string): { label: string; color: string; bg: string } {
  const n = name.toLowerCase();
  if (n.includes('pre-commit') || n.includes('precommit')) return { label: 'Pre-Commit', color: 'var(--status-yellow)', bg: 'var(--status-yellow-bg)' };
  if (n.includes('post-commit') || n.includes('postcommit')) return { label: 'Post-Commit', color: 'var(--status-green)', bg: 'var(--status-green-bg)' };
  if (n.includes('pre-push') || n.includes('prepush')) return { label: 'Pre-Push', color: 'var(--status-red)', bg: 'var(--status-red-bg)' };
  if (n.includes('lint')) return { label: 'Linter', color: 'var(--status-blue)', bg: 'var(--status-blue-bg)' };
  if (n.includes('format')) return { label: 'Formatter', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' };
  return { label: 'Hook', color: 'var(--text-muted)', bg: 'var(--bg-elevated)' };
}

export default function Hooks() {
  const [hooks, setHooks] = useState<HookInfo[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<HookInfo | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHooks();
  }, []);

  const loadHooks = async () => {
    try {
      const data = await invoke<HookInfo[]>('list_hooks');
      setHooks(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const viewHook = async (hook: HookInfo) => {
    setSelected(hook);
    try {
      const data = await invoke<string>('get_memory_file', {
        filename: `../hooks/${hook.name}`
      });
      setContent(data);
    } catch {
      setContent(`Hook: ${hook.name}\nPath: ${hook.path}\nSize: ${(hook.size_bytes / 1024).toFixed(1)} KB\n\nCould not read hook content.`);
    }
  };

  const filtered = hooks.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="loading"><div className="spinner" /> Loading hooks...</div>;
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2>Hooks</h2>
            <p>{hooks.length} hooks configured · Automation triggers for your workflow</p>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div className="search-input" style={{ maxWidth: '400px' }}>
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input
            placeholder="Search hooks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <X size={14} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setSearch('')} />
          )}
        </div>
      </div>

      {/* Selected hook detail */}
      {selected && (
        <div className="card slide-in" style={{ marginBottom: '20px' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Webhook size={18} style={{ color: 'white' }} />
              </div>
              <div>
                <span className="card-title">{selected.name}</span>
                <div className="card-subtitle">
                  {(selected.size_bytes / 1024).toFixed(1)} KB · {getHookType(selected.name).label}
                </div>
              </div>
            </div>
            <button className="btn btn-sm" onClick={() => setSelected(null)}>
              <X size={14} /> Close
            </button>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
            <FolderOpen size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            {selected.path}
          </div>
          <pre style={{
            background: 'var(--bg-input)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-primary)',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.5',
            maxHeight: '500px',
            overflow: 'auto',
          }}>
            {content}
          </pre>
        </div>
      )}

      {/* Hooks List */}
      <div className="card">
        <div className="data-list">
          {filtered.map(hook => {
            const hookType = getHookType(hook.name);
            return (
              <button
                key={hook.name}
                className={`data-list-item ${selected?.name === hook.name ? 'active' : ''}`}
                onClick={() => viewHook(hook)}
              >
                <Code2 size={16} style={{ color: hookType.color, flexShrink: 0 }} />
                <span className="data-list-name">{hook.name}</span>
                <span className="badge" style={{
                  background: hookType.bg,
                  color: hookType.color,
                }}>
                  {hookType.label}
                </span>
                <span className="data-list-meta">
                  {(hook.size_bytes / 1024).toFixed(1)} KB
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <Webhook size={48} />
          <p>{hooks.length === 0
            ? 'No hooks configured yet. Add hooks in .agent/hooks/'
            : `No hooks match "${search}"`
          }</p>
        </div>
      )}
    </div>
  );
}
