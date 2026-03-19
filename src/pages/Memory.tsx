import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { MemoryStick, Search, X, FileText, FolderTree, HardDrive } from 'lucide-react';

function getFileIcon(name: string): { label: string; color: string } {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (ext === 'md') return { label: 'Markdown', color: 'var(--status-blue)' };
  if (ext === 'json') return { label: 'JSON', color: 'var(--status-yellow)' };
  if (ext === 'yaml' || ext === 'yml') return { label: 'YAML', color: 'var(--status-green)' };
  if (ext === 'txt') return { label: 'Text', color: 'var(--text-muted)' };
  if (ext === 'log') return { label: 'Log', color: 'var(--status-red)' };
  return { label: ext.toUpperCase() || 'File', color: 'var(--text-muted)' };
}

export default function MemoryPage() {
  const [files, setFiles] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const data = await invoke<string[]>('list_memory_files');
      setFiles(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const viewFile = async (filename: string) => {
    setSelected(filename);
    try {
      const data = await invoke<string>('get_memory_file', { filename });
      setContent(data);
    } catch {
      setContent(`Could not read ${filename}`);
    }
  };

  const filtered = files.filter(f =>
    f.toLowerCase().includes(search.toLowerCase())
  );

  const totalSize = files.length;

  if (loading) {
    return <div className="loading"><div className="spinner" /> Loading memory files...</div>;
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2>Memory</h2>
            <p>{totalSize} memory files · Agent persistent storage</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <HardDrive size={16} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              .agent/memory/
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div className="search-input" style={{ maxWidth: '400px' }}>
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input
            placeholder="Search memory files..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <X size={14} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setSearch('')} />
          )}
        </div>
      </div>

      {/* Split Layout: file list + content viewer */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: selected ? '280px 1fr' : '1fr',
          minHeight: '500px',
        }}>
          {/* File list side */}
          <div style={{
            borderRight: selected ? '1px solid var(--border-primary)' : 'none',
            overflow: 'auto',
            maxHeight: '600px',
          }}>
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-primary)',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <FolderTree size={12} />
              Files ({filtered.length})
            </div>
            <div className="data-list">
              {filtered.map(file => {
                const fi = getFileIcon(file);
                return (
                  <button
                    key={file}
                    className={`data-list-item ${selected === file ? 'active' : ''}`}
                    onClick={() => viewFile(file)}
                    style={{ padding: '10px 16px' }}
                  >
                    <FileText size={14} style={{ color: fi.color, flexShrink: 0 }} />
                    <span style={{
                      fontSize: '12px', fontWeight: 500,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      flex: 1,
                    }}>
                      {file}
                    </span>
                    <span style={{
                      fontSize: '10px', color: fi.color, fontFamily: 'var(--font-mono)',
                      background: `${fi.color}15`,
                      padding: '1px 6px', borderRadius: '4px',
                    }}>
                      {fi.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content viewer side */}
          {selected && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{
                padding: '10px 16px',
                borderBottom: '1px solid var(--border-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-secondary)',
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--text-accent)',
                }}>
                  {selected}
                </span>
                <button className="btn btn-sm" onClick={() => setSelected(null)}>
                  <X size={12} /> Close
                </button>
              </div>
              <pre style={{
                flex: 1,
                padding: '16px',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                overflow: 'auto',
                maxHeight: '550px',
                margin: 0,
                background: 'var(--bg-input)',
              }}>
                {content}
              </pre>
            </div>
          )}

          {/* Empty viewer state */}
          {!selected && filtered.length > 0 && (
            <div style={{ display: 'none' }} />
          )}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <MemoryStick size={48} />
          <p>{files.length === 0
            ? 'No memory files found. Memory files will appear in .agent/memory/'
            : `No files match "${search}"`
          }</p>
        </div>
      )}
    </div>
  );
}
