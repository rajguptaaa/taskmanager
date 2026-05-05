import { useEffect, useState } from 'react';
import api from '../utils/api';

const fmt = d => d ? new Date(d).toLocaleDateString('en-GB', {day:'2-digit',month:'short'}) : '—';
const isOverdue = d => d && new Date(d) < new Date();

function StatusBadge({ s }) {
  return <span className={`badge badge-${s.replace(' ','-')}`}>{s}</span>;
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-body" style={{color:'var(--muted)'}}>Loading…</div>;

  const { stats, overdueTasks, recentTasks } = data;

  return (
    <>
      <div className="page-header">
        <div className="page-title">Dashboard</div>
        <div className="page-sub">Overview of your tasks and projects</div>
      </div>
      <div className="page-body">
        <div className="stats-grid">
          {[
            { label: 'Total Tasks', value: stats.total, color: 'var(--text)' },
            { label: 'To Do', value: stats.todo, color: '#6b7280' },
            { label: 'In Progress', value: stats.inProgress, color: 'var(--accent)' },
            { label: 'Done', value: stats.done, color: 'var(--success)' },
            { label: 'Overdue', value: stats.overdue, color: 'var(--danger)' },
            { label: 'Projects', value: stats.projects, color: '#7c3aed' },
          ].map(s => (
            <div className="stat-card" key={s.label}>
              <div className="stat-value" style={{color: s.color}}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Tasks</span>
            </div>
            {recentTasks.length === 0
              ? <div className="empty"><div className="empty-icon">✓</div>No tasks yet</div>
              : recentTasks.map(t => (
                <div key={t._id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
                  <div>
                    <div style={{fontSize:'13.5px',fontWeight:500}}>{t.title}</div>
                    <div style={{fontSize:'11px',color:'var(--muted)',marginTop:'2px'}}>{t.project?.name}</div>
                  </div>
                  <StatusBadge s={t.status} />
                </div>
              ))
            }
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title" style={{color:'var(--danger)'}}>Overdue Tasks</span>
            </div>
            {overdueTasks.length === 0
              ? <div className="empty"><div className="empty-icon">🎉</div>No overdue tasks</div>
              : overdueTasks.map(t => (
                <div key={t._id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
                  <div>
                    <div style={{fontSize:'13.5px',fontWeight:500}}>{t.title}</div>
                    <div style={{fontSize:'11px',color:'var(--danger)',marginTop:'2px'}}>Due {fmt(t.dueDate)}</div>
                  </div>
                  <StatusBadge s={t.status} />
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </>
  );
}
