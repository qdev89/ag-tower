import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Search, Zap, FileCheck, X } from 'lucide-react';

interface SkillInfo {
  name: string;
  description: string;
  path: string;
  has_skill_md: boolean;
  size_bytes: number;
}

export default function SkillsCatalog() {
  const [skills, setSkills] = useState<SkillInfo[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<SkillInfo | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const data = await invoke<SkillInfo[]>('list_skills');
      setSkills(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const viewSkill = async (skill: SkillInfo) => {
    setSelected(skill);
    try {
      const data = await invoke<string>('get_skill_content', { name: skill.name });
      setContent(data);
    } catch {
      setContent('SKILL.md not found');
    }
  };

  const filtered = skills.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="loading"><div className="spinner" /> Loading skills catalog...</div>;
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2>Skills Catalog</h2>
            <p>{skills.length} skills available · {filtered.length} matching</p>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div className="search-input" style={{ maxWidth: '400px' }}>
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input
            placeholder="Search skills by name or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <X size={14} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setSearch('')} />
          )}
        </div>
      </div>

      {/* Selected skill detail */}
      {selected && (
        <div className="card slide-in" style={{ marginBottom: '20px' }}>
          <div className="card-header">
            <div>
              <span className="card-title">{selected.name}</span>
              <div className="card-subtitle">{selected.description}</div>
            </div>
            <button className="btn btn-sm" onClick={() => setSelected(null)}>
              <X size={14} /> Close
            </button>
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
            maxHeight: '400px',
            overflow: 'auto',
          }}>
            {content}
          </pre>
        </div>
      )}

      {/* Skills Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '12px',
      }}>
        {filtered.map(skill => (
          <button
            key={skill.name}
            className="card"
            onClick={() => viewSkill(skill)}
            style={{
              textAlign: 'left',
              cursor: 'pointer',
              border: selected?.name === skill.name ? '1px solid var(--accent-primary)' : undefined,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Zap size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
              <span style={{ fontWeight: 600, fontSize: '13px' }}>{skill.name}</span>
              {skill.has_skill_md && (
                <FileCheck size={12} style={{ color: 'var(--status-green)', marginLeft: 'auto', flexShrink: 0 }} />
              )}
            </div>
            <p style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              lineHeight: '1.5',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {skill.description || 'No description'}
            </p>
            <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {(skill.size_bytes / 1024).toFixed(1)} KB
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <Zap size={48} />
          <p>No skills match "{search}"</p>
        </div>
      )}
    </div>
  );
}
