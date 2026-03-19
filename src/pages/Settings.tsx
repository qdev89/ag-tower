import { useState } from 'react';
import {
  Settings, Cloud, HardDrive, Monitor, Shield,
  RefreshCw, FolderSync, Check, AlertTriangle,
  Lock, Unlock
} from 'lucide-react';

// ============================================================
// Settings — Cross-Machine Sync + Safety Controls (gstack /careful /freeze /guard)
// ============================================================

interface SyncConfig {
  enabled: boolean;
  provider: 'gdrive' | 'onedrive' | 'manual';
  lastSync: string;
  autoSyncInterval: number; // minutes
  syncKnowledge: boolean;
  syncBrain: boolean;
  syncSkills: boolean;
}

interface SafetyConfig {
  carefulMode: boolean; // Warn before destructive commands
  guardMode: boolean;   // Maximum safety — lock all non-target dirs
  frozenDirs: string[]; // Directories locked from edits
}

export default function SettingsPage() {
  const [syncConfig, setSyncConfig] = useState<SyncConfig>({
    enabled: true,
    provider: 'gdrive',
    lastSync: '2026-03-19 23:45',
    autoSyncInterval: 30,
    syncKnowledge: true,
    syncBrain: true,
    syncSkills: false,
  });

  const [safety, setSafety] = useState<SafetyConfig>({
    carefulMode: true,
    guardMode: false,
    frozenDirs: ['src-tauri/', 'node_modules/'],
  });

  const [newFreezeDir, setNewFreezeDir] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const toggleSync = (key: keyof SyncConfig) => {
    setSyncConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSafety = (key: keyof SafetyConfig) => {
    setSafety(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const addFreezeDir = () => {
    if (newFreezeDir && !safety.frozenDirs.includes(newFreezeDir)) {
      setSafety(prev => ({ ...prev, frozenDirs: [...prev.frozenDirs, newFreezeDir] }));
      setNewFreezeDir('');
    }
  };

  const removeFreezeDir = (dir: string) => {
    setSafety(prev => ({ ...prev, frozenDirs: prev.frozenDirs.filter(d => d !== dir) }));
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Settings size={22} style={{ color: 'var(--text-accent)' }} />
          Settings
        </h2>
        <p>Cross-machine sync · Safety controls · Preferences</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* ──── Cross-Machine Sync ──── */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cloud size={18} style={{ color: 'var(--status-blue)' }} />
              <span className="card-title">Cross-Machine Sync</span>
            </div>
            <div
              className={`toggle ${syncConfig.enabled ? 'active' : ''}`}
              onClick={() => toggleSync('enabled')}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Provider */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                Sync Provider
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['gdrive', 'onedrive', 'manual'] as const).map(p => (
                  <button
                    key={p}
                    className={`btn btn-sm ${syncConfig.provider === p ? 'btn-primary' : ''}`}
                    onClick={() => setSyncConfig(prev => ({ ...prev, provider: p }))}
                  >
                    {p === 'gdrive' ? '☁️ Google Drive' : p === 'onedrive' ? '📁 OneDrive' : '🔧 Manual'}
                  </button>
                ))}
              </div>
            </div>

            {/* Sync items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { key: 'syncKnowledge' as const, label: 'Knowledge Base', icon: <HardDrive size={14} />, desc: '~/.gemini/antigravity/knowledge/' },
                { key: 'syncBrain' as const, label: 'Brain Data', icon: <Monitor size={14} />, desc: '~/.gemini/antigravity/brain/' },
                { key: 'syncSkills' as const, label: 'Global Skills', icon: <FolderSync size={14} />, desc: '~/.gemini/antigravity/skills/' },
              ].map(item => (
                <div key={item.key} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-primary)',
                }}>
                  <span style={{ color: 'var(--text-accent)' }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>{item.label}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {item.desc}
                    </div>
                  </div>
                  <div
                    className={`toggle ${syncConfig[item.key] ? 'active' : ''}`}
                    onClick={() => toggleSync(item.key)}
                  />
                </div>
              ))}
            </div>

            {/* Last sync info */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 12px',
              background: 'rgba(16,185,129,0.08)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(16,185,129,0.2)',
            }}>
              <Check size={14} style={{ color: 'var(--status-green)' }} />
              <span style={{ fontSize: '11px', color: 'var(--status-green)' }}>
                Last synced: {syncConfig.lastSync}
              </span>
              <button className="btn btn-sm" style={{ marginLeft: 'auto' }}>
                <RefreshCw size={12} /> Sync Now
              </button>
            </div>
          </div>
        </div>

        {/* ──── Safety Controls (gstack /careful /freeze /guard) ──── */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} style={{ color: safety.guardMode ? 'var(--status-red)' : 'var(--status-yellow)' }} />
              <span className="card-title">Safety Controls</span>
            </div>
            <span className="badge" style={{
              background: safety.guardMode ? 'var(--status-red-bg)' : safety.carefulMode ? 'var(--status-yellow-bg)' : 'var(--bg-elevated)',
              color: safety.guardMode ? 'var(--status-red)' : safety.carefulMode ? 'var(--status-yellow)' : 'var(--text-muted)',
            }}>
              {safety.guardMode ? '🛡️ GUARD' : safety.carefulMode ? '⚠️ CAREFUL' : '🟢 NORMAL'}
            </span>
          </div>

          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Inspired by gstack's <code>/careful</code>, <code>/freeze</code>, <code>/guard</code> commands.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Careful Mode */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px',
              background: safety.carefulMode ? 'rgba(245,158,11,0.08)' : 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${safety.carefulMode ? 'rgba(245,158,11,0.2)' : 'var(--border-primary)'}`,
            }}>
              <AlertTriangle size={20} style={{ color: safety.carefulMode ? 'var(--status-yellow)' : 'var(--text-muted)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Careful Mode</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Warn before destructive commands (rm, drop, force-push)
                </div>
              </div>
              <div
                className={`toggle ${safety.carefulMode ? 'active' : ''}`}
                onClick={() => toggleSafety('carefulMode')}
              />
            </div>

            {/* Guard Mode */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px',
              background: safety.guardMode ? 'rgba(239,68,68,0.08)' : 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${safety.guardMode ? 'rgba(239,68,68,0.2)' : 'var(--border-primary)'}`,
            }}>
              <Shield size={20} style={{ color: safety.guardMode ? 'var(--status-red)' : 'var(--text-muted)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Guard Mode</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Maximum safety — lock ALL non-target directories
                </div>
              </div>
              <div
                className={`toggle ${safety.guardMode ? 'active' : ''}`}
                onClick={() => toggleSafety('guardMode')}
              />
            </div>

            {/* Freeze Zones */}
            <div>
              <div style={{
                fontSize: '12px', fontWeight: 600, marginBottom: '8px',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <Lock size={14} style={{ color: 'var(--status-blue)' }} />
                Frozen Directories
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {safety.frozenDirs.map(dir => (
                  <div key={dir} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 12px',
                    background: 'rgba(239,68,68,0.06)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(239,68,68,0.15)',
                  }}>
                    <Lock size={12} style={{ color: 'var(--status-red)' }} />
                    <code style={{
                      flex: 1, fontSize: '11px', fontFamily: 'var(--font-mono)',
                      color: 'var(--text-secondary)',
                    }}>
                      {dir}
                    </code>
                    <button
                      className="btn btn-sm"
                      onClick={() => removeFreezeDir(dir)}
                      style={{ padding: '2px 8px' }}
                    >
                      <Unlock size={10} /> Unfreeze
                    </button>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    style={{
                      flex: 1, background: 'var(--bg-input)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '6px 10px', fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-primary)',
                    }}
                    placeholder="path/to/freeze/"
                    value={newFreezeDir}
                    onChange={e => setNewFreezeDir(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addFreezeDir()}
                  />
                  <button className="btn btn-sm btn-primary" onClick={addFreezeDir}>
                    <Lock size={10} /> Freeze
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ──── Advanced Settings ──── */}
      <div className="card" style={{ marginTop: '16px' }}>
        <button
          className="card-header"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{ cursor: 'pointer', width: '100%' }}
        >
          <span className="card-title">Advanced Settings</span>
          <span style={{
            color: 'var(--text-muted)', fontSize: '12px',
            transition: 'transform var(--transition-fast)',
            transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)',
          }}>
            ▼
          </span>
        </button>

        {showAdvanced && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '12px' }}>
            {/* Auto-sync interval */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 12px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
            }}>
              <span style={{ fontSize: '12px', fontWeight: 600, width: '140px' }}>Auto-sync interval</span>
              <select
                style={{
                  background: 'var(--bg-input)', border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-sm)', padding: '4px 8px',
                  color: 'var(--text-primary)', fontSize: '12px',
                }}
                value={syncConfig.autoSyncInterval}
                onChange={e => setSyncConfig(prev => ({ ...prev, autoSyncInterval: Number(e.target.value) }))}
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={0}>Manual only</option>
              </select>
            </div>

            {/* Theme */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 12px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
            }}>
              <span style={{ fontSize: '12px', fontWeight: 600, width: '140px' }}>Theme</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button className="btn btn-sm btn-primary">🌙 Dark</button>
                <button className="btn btn-sm">☀️ Light</button>
                <button className="btn btn-sm">🖥️ System</button>
              </div>
            </div>

            {/* Workspace */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 12px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
            }}>
              <span style={{ fontSize: '12px', fontWeight: 600, width: '140px' }}>Active Workspace</span>
              <code style={{
                flex: 1, fontSize: '11px', fontFamily: 'var(--font-mono)',
                color: 'var(--text-accent)',
              }}>
                c:\Users\Anh Quoc\Documents\GitHub\AppXDevKit
              </code>
              <button className="btn btn-sm">Change</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
