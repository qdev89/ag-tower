import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { BookOpen, FileText, HardDrive } from 'lucide-react';

interface KnowledgeBaseInfo {
  name: string;
  path: string;
  artifact_count: number;
  total_size_bytes: number;
}

export default function KnowledgeBases() {
  const [kbs, setKbs] = useState<KnowledgeBaseInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKBs();
  }, []);

  const loadKBs = async () => {
    try {
      const data = await invoke<KnowledgeBaseInfo[]>('list_knowledge_bases');
      setKbs(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return <div className="loading"><div className="spinner" /> Loading knowledge bases...</div>;
  }

  const totalSize = kbs.reduce((sum, kb) => sum + kb.total_size_bytes, 0);
  const totalArtifacts = kbs.reduce((sum, kb) => sum + kb.artifact_count, 0);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Knowledge Bases</h2>
        <p>{kbs.length} knowledge bases · {totalArtifacts} artifacts · {formatSize(totalSize)}</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px',
      }}>
        {kbs.map(kb => (
          <div key={kb.name} className="card" style={{ cursor: 'default' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <BookOpen size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px', wordBreak: 'break-word' }}>
                  {kb.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {kb.name}
                </div>
              </div>
            </div>
            <div style={{
              display: 'flex', gap: '16px', marginTop: '16px',
              paddingTop: '12px', borderTop: '1px solid var(--border-primary)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <FileText size={12} />
                {kb.artifact_count} artifacts
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <HardDrive size={12} />
                {formatSize(kb.total_size_bytes)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {kbs.length === 0 && (
        <div className="empty-state">
          <BookOpen size={48} />
          <p>No knowledge bases found</p>
        </div>
      )}
    </div>
  );
}
