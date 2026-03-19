import { useState, useEffect } from 'react';
import {
  BarChart3, GitCommit, FileCode, TestTube2,
  TrendingUp, Calendar, Flame, Clock,
  ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

// ============================================================
// Retro Dashboard — gstack /retro inspired
// Developer stats, shipping streaks, code health
// ============================================================

interface GitStats {
  commits_this_week: number;
  files_changed: number;
  lines_added: number;
  lines_removed: number;
}

interface WeekStats {
  commits: number;
  filesChanged: number;
  locAdded: number;
  locRemoved: number;
  testsWritten: number;
  reviewsCompleted: number;
  issuesFixed: number;
  shippingStreak: number;
}

const fallbackStats: WeekStats = {
  commits: 34,
  filesChanged: 47,
  locAdded: 2847,
  locRemoved: 891,
  testsWritten: 18,
  reviewsCompleted: 6,
  issuesFixed: 12,
  shippingStreak: 7,
};

const weeklyTrend = [3, 5, 8, 4, 7, 12, 9]; // commits per day

const hotFiles = [
  { path: 'src/App.tsx', changes: 14, trend: 'up' as const },
  { path: 'src/pages/SprintPipeline.tsx', changes: 11, trend: 'up' as const },
  { path: 'src/pages/McpManager.tsx', changes: 8, trend: 'same' as const },
  { path: 'src/pages/Dashboard.tsx', changes: 6, trend: 'down' as const },
  { path: 'src/index.css', changes: 5, trend: 'up' as const },
];

const coverageTrend = [72, 74, 73, 78, 80, 82, 87]; // % over 7 days

function StatCard({ label, value, icon, color, sub }: {
  label: string; value: string | number; icon: React.ReactNode;
  color: string; sub?: string;
}) {
  return (
    <div className="card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {label}
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color, marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            {value}
          </div>
          {sub && <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{sub}</div>}
        </div>
        <div style={{
          width: '36px', height: '36px',
          borderRadius: 'var(--radius-md)',
          background: `${color}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color,
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function MiniBar({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '40px' }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex: 1, borderRadius: '2px 2px 0 0',
          background: i === data.length - 1 ? color : `${color}40`,
          height: `${(v / max) * 100}%`,
          minHeight: '3px',
          transition: 'height 0.3s ease',
        }} />
      ))}
    </div>
  );
}

function ContributionGrid() {
  // 7 weeks × 7 days = 49 cells
  const data = Array.from({ length: 49 }, () => Math.floor(Math.random() * 5));
  const levels = ['rgba(139,92,246,0.05)', 'rgba(139,92,246,0.2)', 'rgba(139,92,246,0.4)', 'rgba(139,92,246,0.6)', 'rgba(139,92,246,0.85)'];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
      {data.map((v, i) => (
        <div key={i} style={{
          width: '100%', aspectRatio: '1',
          borderRadius: '3px',
          background: levels[v],
          transition: 'all var(--transition-fast)',
        }} title={`${v} contributions`} />
      ))}
    </div>
  );
}

export default function Retro() {
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [stats, setStats] = useState<WeekStats>(fallbackStats);

  useEffect(() => {
    invoke<GitStats>('get_git_stats')
      .then(gs => {
        setStats(prev => ({
          ...prev,
          commits: gs.commits_this_week || prev.commits,
          filesChanged: gs.files_changed || prev.filesChanged,
          locAdded: gs.lines_added || prev.locAdded,
          locRemoved: gs.lines_removed || prev.locRemoved,
        }));
      })
      .catch(() => {}); // keep fallback
  }, []);

  const demoStats = stats;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BarChart3 size={22} style={{ color: 'var(--text-accent)' }} />
              Retro Dashboard
            </h2>
            <p>Sprint retrospective · Developer stats · Code health</p>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {(['week', 'month'] as const).map(p => (
              <button
                key={p}
                className={`btn btn-sm ${period === p ? 'btn-primary' : ''}`}
                onClick={() => setPeriod(p)}
              >
                This {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Shipping Streak Banner */}
      <div style={{
        padding: '16px 20px',
        background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(239,68,68,0.08) 100%)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(245,158,11,0.2)',
        display: 'flex', alignItems: 'center', gap: '12px',
        marginBottom: '20px',
      }}>
        <Flame size={28} style={{ color: '#F59E0B' }} />
        <div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#F59E0B' }}>
            🔥 {demoStats.shippingStreak}-Day Shipping Streak!
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            You've shipped code every day for {demoStats.shippingStreak} days straight.
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <StatCard label="Commits" value={demoStats.commits} icon={<GitCommit size={18} />} color="var(--text-accent)" sub="+12% vs last week" />
        <StatCard label="Files Changed" value={demoStats.filesChanged} icon={<FileCode size={18} />} color="var(--status-blue)" sub={`+${demoStats.locAdded} / -${demoStats.locRemoved} LOC`} />
        <StatCard label="Tests Written" value={demoStats.testsWritten} icon={<TestTube2 size={18} />} color="var(--status-green)" sub="87% coverage" />
        <StatCard label="Reviews" value={demoStats.reviewsCompleted} icon={<TrendingUp size={18} />} color="var(--status-yellow)" sub={`${demoStats.issuesFixed} issues fixed`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
        {/* Activity & Hot Files */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Commit Activity */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Commit Activity</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                <Calendar size={12} style={{ marginRight: '4px' }} /> Last 7 days
              </span>
            </div>
            <MiniBar data={weeklyTrend} color="var(--text-accent)" />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <span key={d} style={{ fontSize: '9px', color: 'var(--text-muted)', flex: 1, textAlign: 'center' }}>
                  {d}
                </span>
              ))}
            </div>
          </div>

          {/* Hot Files */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">🔥 Hotspot Files</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Most modified</span>
            </div>
            {hotFiles.map((file, i) => (
              <div key={file.path} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px 0',
                borderBottom: i < hotFiles.length - 1 ? '1px solid var(--border-primary)' : 'none',
              }}>
                <span style={{
                  width: '20px', height: '20px',
                  borderRadius: '50%',
                  background: 'var(--bg-elevated)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)',
                }}>
                  {i + 1}
                </span>
                <code style={{ flex: 1, fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                  {file.path}
                </code>
                <span style={{
                  fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700,
                  color: 'var(--text-accent)',
                }}>
                  {file.changes}
                </span>
                {file.trend === 'up' ? <ArrowUpRight size={12} style={{ color: 'var(--status-red)' }} />
                  : file.trend === 'down' ? <ArrowDownRight size={12} style={{ color: 'var(--status-green)' }} />
                    : <Minus size={12} style={{ color: 'var(--text-muted)' }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Contribution grid + coverage */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Contribution Grid */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Contributions</span>
            </div>
            <ContributionGrid />
          </div>

          {/* Coverage Trend */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Test Coverage</span>
              <span style={{
                fontSize: '14px', fontWeight: 800, fontFamily: 'var(--font-mono)',
                color: coverageTrend[coverageTrend.length - 1] >= 80 ? 'var(--status-green)' : 'var(--status-yellow)',
              }}>
                {coverageTrend[coverageTrend.length - 1]}%
              </span>
            </div>
            <MiniBar data={coverageTrend} color="var(--status-green)" />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              {coverageTrend.map((v, i) => (
                <span key={i} style={{ fontSize: '9px', color: 'var(--text-muted)', flex: 1, textAlign: 'center' }}>
                  {v}%
                </span>
              ))}
            </div>
          </div>

          {/* Time Summary */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <Clock size={14} style={{ marginRight: '4px' }} />
                Phase Breakdown
              </span>
            </div>
            {[
              { phase: '💡 Think', time: '45m', pct: 8 },
              { phase: '📋 Plan', time: '1h 20m', pct: 14 },
              { phase: '🔨 Build', time: '4h 15m', pct: 45 },
              { phase: '🔍 Review', time: '1h', pct: 11 },
              { phase: '🧪 Test', time: '1h 30m', pct: 16 },
              { phase: '🚀 Ship', time: '30m', pct: 5 },
              { phase: '📊 Reflect', time: '10m', pct: 1 },
            ].map(item => (
              <div key={item.phase} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                marginBottom: '6px',
              }}>
                <span style={{ fontSize: '11px', width: '80px' }}>{item.phase}</span>
                <div style={{
                  flex: 1, height: '6px',
                  background: 'var(--bg-elevated)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', borderRadius: '3px',
                    background: 'var(--accent-gradient)',
                    width: `${item.pct}%`,
                  }} />
                </div>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', width: '50px', textAlign: 'right' }}>
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
