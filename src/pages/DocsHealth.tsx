import { useState, useEffect } from 'react';
import {
  FileText, AlertTriangle, CheckCircle2,
  Clock, RefreshCw, ExternalLink,
  FileWarning, Sparkles
} from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

// ============================================================
// DocsHealth — gstack /document-release inspired
// Documentation drift detector
// ============================================================

interface DocInfo {
  name: string;
  path: string;
  size_bytes: number;
  last_modified: string;
  days_stale: number;
}

function getHealthColor(days: number): string {
  if (days <= 1) return 'var(--status-green)';
  if (days <= 7) return 'var(--status-blue)';
  if (days <= 14) return 'var(--status-yellow)';
  return 'var(--status-red)';
}

function getHealthLabel(days: number): string {
  if (days <= 1) return '✅ Fresh';
  if (days <= 7) return '🟢 Current';
  if (days <= 14) return '⚠️ Getting Stale';
  return '🔴 Stale';
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocsHealth() {
  const [docs, setDocs] = useState<DocInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDocs = () => {
    setLoading(true);
    invoke<DocInfo[]>('list_docs_health')
      .then(d => {
        setDocs(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const freshCount = docs.filter(d => d.days_stale <= 7).length;
  const staleCount = docs.filter(d => d.days_stale > 14).length;
  const totalDocs = docs.length;
  const healthScore = totalDocs > 0
    ? Math.round((freshCount / totalDocs) * 100)
    : 0;

  if (loading) {
    return (
      <div className="fade-in">
        <div className="empty-state">
          <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} />
          <p>Scanning documentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={22} style={{ color: 'var(--status-blue)' }} />
              Docs Health
            </h2>
            <p>Documentation drift detector · {totalDocs} documents tracked</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn" onClick={loadDocs}>
              <RefreshCw size={14} /> Refresh
            </button>
            <button className="btn btn-primary">
              <Sparkles size={14} /> Update All Docs
            </button>
          </div>
        </div>
      </div>

      {/* Health Score */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px', marginBottom: '20px',
      }}>
        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{
            fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-mono)',
            color: healthScore >= 70 ? 'var(--status-green)' :
              healthScore >= 40 ? 'var(--status-yellow)' : 'var(--status-red)',
          }}>
            {healthScore}%
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
            Health Score
          </div>
        </div>
        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-accent)' }}>
            {totalDocs}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
            Total Docs
          </div>
        </div>
        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--status-green)' }}>
            {freshCount}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
            Fresh (≤7d)
          </div>
        </div>
        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--status-red)' }}>
            {staleCount}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
            Stale ({'>'}14d)
          </div>
        </div>
      </div>

      {/* Docs list */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border-primary)',
          display: 'flex', alignItems: 'center',
          background: 'var(--bg-secondary)',
        }}>
          <span style={{ flex: 2, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>
            Document
          </span>
          <span style={{ flex: 1, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', textAlign: 'center' }}>
            Status
          </span>
          <span style={{ flex: 1, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', textAlign: 'center' }}>
            Last Modified
          </span>
          <span style={{ flex: 1, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', textAlign: 'right' }}>
            Size
          </span>
        </div>

        {docs.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px' }}>
            <FileWarning size={32} style={{ color: 'var(--text-muted)' }} />
            <p>No tracked documents found</p>
          </div>
        ) : (
          docs.map((doc, i) => (
            <div key={doc.path} style={{
              display: 'flex', alignItems: 'center',
              padding: '14px 20px',
              borderBottom: i < docs.length - 1 ? '1px solid var(--border-primary)' : 'none',
              transition: 'all var(--transition-fast)',
            }}>
              {/* Name & path */}
              <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '10px' }}>
                {doc.days_stale <= 7 ? (
                  <CheckCircle2 size={16} style={{ color: 'var(--status-green)', flexShrink: 0 }} />
                ) : doc.days_stale <= 14 ? (
                  <Clock size={16} style={{ color: 'var(--status-yellow)', flexShrink: 0 }} />
                ) : (
                  <AlertTriangle size={16} style={{ color: 'var(--status-red)', flexShrink: 0 }} />
                )}
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{doc.name}</div>
                  <div style={{
                    fontSize: '10px', color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {doc.path.replace(/\\/g, '/').split('/').slice(-3).join('/')}
                  </div>
                </div>
              </div>

              {/* Status badge */}
              <div style={{ flex: 1, textAlign: 'center' }}>
                <span className="badge" style={{
                  background: `${getHealthColor(doc.days_stale)}15`,
                  color: getHealthColor(doc.days_stale),
                }}>
                  {getHealthLabel(doc.days_stale)}
                </span>
              </div>

              {/* Last modified */}
              <div style={{ flex: 1, textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
                {doc.last_modified}
              </div>

              {/* Size */}
              <div style={{
                flex: 1, textAlign: 'right',
                fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
              }}>
                {formatBytes(doc.size_bytes)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Action suggestions */}
      {staleCount > 0 && (
        <div style={{
          marginTop: '16px', padding: '14px 18px',
          background: 'rgba(245,158,11,0.08)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(245,158,11,0.2)',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <AlertTriangle size={18} style={{ color: 'var(--status-yellow)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--status-yellow)' }}>
              {staleCount} stale document{staleCount > 1 ? 's' : ''} detected
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Run <code>/wf-docs</code> to auto-generate updated documentation
            </div>
          </div>
          <button className="btn btn-sm">
            <ExternalLink size={12} /> Run /wf-docs
          </button>
        </div>
      )}
    </div>
  );
}
