import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Search, Power, PowerOff, AlertCircle } from 'lucide-react';

interface McpServerEntry {
  name: string;
  config: Record<string, unknown>;
  disabled: boolean;
}

export default function McpManager() {
  const [raw, setRaw] = useState('');
  const [servers, setServers] = useState<McpServerEntry[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const content = await invoke<string>('get_mcp_config');
      setRaw(content);
      parseServers(content);
    } catch (e) {
      setError(String(e));
    }
  };

  const parseServers = (content: string) => {
    try {
      const cfg = JSON.parse(content);
      const entries: McpServerEntry[] = [];
      const mcpServers = cfg.mcpServers || {};
      for (const [key, val] of Object.entries(mcpServers)) {
        const v = val as Record<string, unknown>;
        entries.push({
          name: key,
          config: v,
          disabled: Boolean(v.disabled),
        });
      }
      entries.sort((a, b) => a.name.localeCompare(b.name));
      setServers(entries);
      if (entries.length > 0 && !selected) {
        setSelected(entries[0].name);
      }
    } catch {
      setError('Failed to parse MCP config');
    }
  };

  const toggleServer = async (name: string, enabled: boolean) => {
    try {
      const result = await invoke<string>('toggle_mcp_server', {
        serverName: name,
        enabled,
      });
      setRaw(result);
      parseServers(result);
    } catch (e) {
      setError(String(e));
    }
  };

  const saveConfig = async () => {
    try {
      JSON.parse(editContent); // Validate
      await invoke('save_mcp_config', { content: editContent });
      setRaw(editContent);
      parseServers(editContent);
      setEditing(false);
      setError('');
    } catch (e) {
      setError(String(e));
    }
  };

  const filtered = servers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedServer = servers.find(s => s.name === selected);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2>MCP Servers</h2>
            <p>{servers.length} servers configured</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`btn ${editing ? 'btn-primary' : ''}`}
              onClick={() => {
                if (editing) {
                  saveConfig();
                } else {
                  setEditContent(raw);
                  setEditing(true);
                }
              }}
            >
              {editing ? 'Save Config' : 'Edit Raw JSON'}
            </button>
            {editing && (
              <button className="btn" onClick={() => setEditing(false)}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="badge badge-red" style={{ marginBottom: '16px', padding: '8px 14px' }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {editing ? (
        <div className="editor-container">
          <div className="editor-toolbar">
            <span className="editor-filename">mcp_config.json</span>
          </div>
          <textarea
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            style={{
              width: '100%',
              minHeight: '500px',
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              border: 'none',
              padding: '16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              resize: 'vertical',
              outline: 'none',
            }}
          />
        </div>
      ) : (
        <div className="split-layout">
          <div className="split-list">
            <div style={{ padding: '12px' }}>
              <div className="search-input">
                <Search size={14} style={{ color: 'var(--text-muted)' }} />
                <input
                  placeholder="Filter servers..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="data-list">
              {filtered.map(s => (
                <button
                  key={s.name}
                  className={`data-list-item ${selected === s.name ? 'active' : ''}`}
                  onClick={() => setSelected(s.name)}
                >
                  <span style={{ color: s.disabled ? 'var(--text-muted)' : 'var(--status-green)' }}>
                    {s.disabled ? <PowerOff size={14} /> : <Power size={14} />}
                  </span>
                  <span className="data-list-name" style={{ opacity: s.disabled ? 0.5 : 1 }}>
                    {s.name}
                  </span>
                  <div
                    className={`toggle ${!s.disabled ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleServer(s.name, s.disabled);
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="split-detail">
            {selectedServer ? (
              <div className="slide-in">
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>
                  {selectedServer.name}
                </h3>
                <div style={{ marginBottom: '16px' }}>
                  <span className={`badge ${selectedServer.disabled ? 'badge-red' : 'badge-green'}`}>
                    {selectedServer.disabled ? 'Disabled' : 'Enabled'}
                  </span>
                  {typeof selectedServer.config.serverUrl === 'string' && (
                    <span className="badge badge-blue" style={{ marginLeft: '8px' }}>
                      Remote
                    </span>
                  )}
                  {typeof selectedServer.config.command === 'string' && (
                    <span className="badge badge-purple" style={{ marginLeft: '8px' }}>
                      Local
                    </span>
                  )}
                </div>
                <pre className="content-viewer" style={{
                  background: 'var(--bg-input)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  fontFamily: 'var(--font-mono)',
                  whiteSpace: 'pre-wrap',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-secondary)',
                }}>
                  {JSON.stringify(selectedServer.config, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="empty-state">
                <p>Select a server to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
