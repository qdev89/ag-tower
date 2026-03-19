import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Brain, ExternalLink, RefreshCw } from 'lucide-react';

export default function BrainSync() {
  const [config, setConfig] = useState<Record<string, unknown> | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const raw = await invoke<string>('get_brain_sync_config');
      setConfig(JSON.parse(raw));
    } catch {
      setConfig({});
    }
  };

  const triggerSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 2000);
    // In a real implementation, this would call the brain sync script
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Brain Sync</h2>
        <p>Sync knowledge between Antigravity and NotebookLM</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Config Card */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Configuration</span>
            <Brain size={18} style={{ color: 'var(--accent-primary)' }} />
          </div>
          {config ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              {Object.entries(config).map(([key, val]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{key}</span>
                  <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '12px', maxWidth: '200px', textAlign: 'right', wordBreak: 'break-all' }}>
                    {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                  </span>
                </div>
              ))}
              {Object.keys(config).length === 0 && (
                <span style={{ color: 'var(--text-muted)' }}>No brain-sync.json found</span>
              )}
            </div>
          ) : (
            <div className="loading"><div className="spinner" /></div>
          )}
        </div>

        {/* Actions Card */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Actions</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="btn btn-primary" onClick={triggerSync} disabled={syncing} style={{ justifyContent: 'center' }}>
              <RefreshCw size={14} className={syncing ? 'pulse' : ''} />
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
            {config && (config as Record<string, string>).notebook_url && (
              <button
                className="btn"
                onClick={() => {
                  const url = (config as Record<string, string>).notebook_url;
                  if (url) window.open(url, '_blank');
                }}
                style={{ justifyContent: 'center' }}
              >
                <ExternalLink size={14} />
                Open NotebookLM
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Raw config */}
      <div className="card" style={{ marginTop: '16px' }}>
        <div className="card-header">
          <span className="card-title">Raw Configuration</span>
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
        }}>
          {config ? JSON.stringify(config, null, 2) : 'Loading...'}
        </pre>
      </div>
    </div>
  );
}
