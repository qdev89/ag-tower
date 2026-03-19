import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { FileText, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

const RULE_FILES = [
  { name: 'ANTIGRAVITY.md', label: 'ANTIGRAVITY.md', description: 'Global agent behavior rules' },
  { name: 'GEMINI.md', label: 'GEMINI.md', description: 'MCP proxy configuration' },
];

export default function RulesEditor() {
  const [activeFile, setActiveFile] = useState(RULE_FILES[0].name);
  const [content, setContent] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const loadFile = async (filename: string) => {
    setActiveFile(filename);
    setLoaded(false);
    setError('');
    setSaved(false);
    try {
      const data = await invoke<string>('get_rule_file', { filename });
      setContent(data);
      setLoaded(true);
    } catch (e) {
      setError(String(e));
      setContent('');
      setLoaded(true);
    }
  };

  const saveFile = async () => {
    setSaving(true);
    setError('');
    try {
      await invoke('save_rule_file', { filename: activeFile, content });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(String(e));
    }
    setSaving(false);
  };

  // Auto-load on mount
  if (!loaded && !error) {
    loadFile(activeFile);
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2>Rules Editor</h2>
            <p>Edit root configuration files for agent behavior</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {saved && (
              <span className="badge badge-green" style={{ padding: '6px 12px' }}>
                <CheckCircle2 size={14} /> Saved
              </span>
            )}
            <button className="btn btn-primary" onClick={saveFile} disabled={saving}>
              <Save size={14} />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="badge badge-red" style={{ marginBottom: '16px', padding: '8px 14px' }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* File tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '0' }}>
        {RULE_FILES.map(f => (
          <button
            key={f.name}
            className={`btn btn-sm ${activeFile === f.name ? '' : ''}`}
            style={{
              borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
              borderBottom: activeFile === f.name ? '2px solid var(--accent-primary)' : 'none',
              background: activeFile === f.name ? 'var(--bg-card)' : 'var(--bg-secondary)',
              color: activeFile === f.name ? 'var(--text-accent)' : 'var(--text-muted)',
            }}
            onClick={() => loadFile(f.name)}
          >
            <FileText size={14} />
            {f.label}
          </button>
        ))}
      </div>

      <div className="editor-container">
        <div className="editor-toolbar">
          <span className="editor-filename">{activeFile}</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {content.length.toLocaleString()} chars · {content.split('\n').length} lines
          </span>
        </div>
        <textarea
          value={content}
          onChange={e => {
            setContent(e.target.value);
            setSaved(false);
          }}
          style={{
            width: '100%',
            minHeight: 'calc(100vh - 280px)',
            background: 'var(--bg-input)',
            color: 'var(--text-primary)',
            border: 'none',
            padding: '16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            lineHeight: '1.6',
            resize: 'none',
            outline: 'none',
            tabSize: 2,
          }}
          spellCheck={false}
        />
      </div>
    </div>
  );
}
