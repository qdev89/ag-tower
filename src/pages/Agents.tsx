import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Bot, Search, FolderOpen, FileCode, X, Users, Cpu, Shield } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface AgentInfo {
  name: string;
  path: string;
  category: string;
}

const categoryMeta: Record<string, { icon: LucideIcon; color: string; label: string }> = {
  root: { icon: Users, color: 'var(--accent-primary)', label: 'Root Agents' },
  specialist: { icon: Cpu, color: 'var(--status-blue)', label: 'Specialists' },
  reviewer: { icon: Shield, color: 'var(--status-green)', label: 'Reviewers' },
};

export default function Agents() {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AgentInfo | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const data = await invoke<AgentInfo[]>('list_agents');
      setAgents(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const viewAgent = async (agent: AgentInfo) => {
    setSelected(agent);
    try {
      setContent(`Agent: ${agent.name}\nCategory: ${agent.category}\nPath: ${agent.path}`);
    } catch {
      setContent(`Agent: ${agent.name}\nCategory: ${agent.category}\nPath: ${agent.path}\n\nNo configuration file found for this agent.`);
    }
  };

  const filtered = agents.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, AgentInfo[]>>((acc, agent) => {
    const cat = agent.category || 'root';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(agent);
    return acc;
  }, {});

  if (loading) {
    return <div className="loading"><div className="spinner" /> Loading agents...</div>;
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2>Agents</h2>
            <p>{agents.length} agents configured</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {Object.entries(grouped).map(([cat, items]) => (
              <span key={cat} className="badge badge-purple" style={{ fontSize: '11px' }}>
                {cat}: {items.length}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div className="search-input" style={{ maxWidth: '400px' }}>
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input
            placeholder="Search agents by name or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <X size={14} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setSearch('')} />
          )}
        </div>
      </div>

      {/* Selected agent detail */}
      {selected && (
        <div className="card slide-in" style={{ marginBottom: '20px' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                background: 'var(--accent-gradient)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Bot size={18} style={{ color: 'white' }} />
              </div>
              <div>
                <span className="card-title">{selected.name}</span>
                <div className="card-subtitle">Category: {selected.category}</div>
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
            maxHeight: '400px',
            overflow: 'auto',
          }}>
            {content}
          </pre>
        </div>
      )}

      {/* Agent Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '12px',
      }}>
        {filtered.map(agent => {
          const meta = categoryMeta[agent.category] || categoryMeta.root;
          const Icon = meta.icon;
          return (
            <button
              key={agent.name + agent.path}
              className="card"
              onClick={() => viewAgent(agent)}
              style={{
                textAlign: 'left',
                cursor: 'pointer',
                border: selected?.name === agent.name ? '1px solid var(--accent-primary)' : undefined,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
                  background: `${meta.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={16} style={{ color: meta.color }} />
                </div>
                <div>
                  <span style={{ fontWeight: 600, fontSize: '13px' }}>{agent.name}</span>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{meta.label}</div>
                </div>
              </div>
              <div style={{
                fontSize: '11px', color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                <FileCode size={11} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                {agent.path.split(/[/\\]/).slice(-2).join('/')}
              </div>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <Bot size={48} />
          <p>{agents.length === 0
            ? 'No agents configured yet. Add agents in .agent/agents/'
            : `No agents match "${search}"`
          }</p>
        </div>
      )}
    </div>
  );
}
