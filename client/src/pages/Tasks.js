import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const fmt = d => d ? new Date(d).toLocaleDateString('en-GB', {day:'2-digit',month:'short',year:'numeric'}) : '—';
const isOverdue = d => d && new Date(d) < new Date();

function Modal({ title, onClose, onSave, children }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={onSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default function Tasks() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filterProject, setFilterProject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState({ title: '', description: '', project: '', assignedTo: '', priority: 'medium', status: 'todo', dueDate: '' });
  const [error, setError] = useState('');

  const load = () => {
    const q = filterProject ? `?projectId=${filterProject}` : '';
    api.get(`/tasks${q}`).then(r => setTasks(r.data));
  };

  useEffect(() => {
    api.get('/projects').then(r => setProjects(r.data));
    api.get('/auth/users').then(r => setUsers(r.data));
  }, []);

  useEffect(() => { load(); }, [filterProject]);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', description: '', project: '', assignedTo: '', priority: 'medium', status: 'todo', dueDate: '' });
    setModal(true);
  };
  const openEdit = t => {
    setEditing(t);
    setForm({
      title: t.title, description: t.description || '',
      project: t.project?._id || '', assignedTo: t.assignedTo?._id || '',
      priority: t.priority, status: t.status,
      dueDate: t.dueDate ? t.dueDate.split('T')[0] : ''
    });
    setModal(true);
  };

  const save = async () => {
    setError('');
    try {
      const payload = { ...form, assignedTo: form.assignedTo || undefined, dueDate: form.dueDate || undefined };
      if (editing) await api.put(`/tasks/${editing._id}`, payload);
      else await api.post('/tasks', payload);
      load(); setModal(false);
    } catch (e) { setError(e.response?.data?.message || 'Error'); }
  };

  const del = async id => {
    if (!window.confirm('Delete task?')) return;
    await api.delete(`/tasks/${id}`); load();
  };

  const quickStatus = async (id, status) => {
    await api.put(`/tasks/${id}`, { status }); load();
  };

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const filtered = filterStatus ? tasks.filter(t => t.status === filterStatus) : tasks;

  return (
    <>
      <div className="page-header">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div>
            <div className="page-title">Tasks</div>
            <div className="page-sub">{filtered.length} task{filtered.length !== 1 ? 's' : ''}</div>
          </div>
          <button className="btn btn-primary" onClick={openCreate} style={{marginTop:'4px'}}>+ New Task</button>
        </div>
        <div style={{display:'flex',gap:10,marginBottom:16,marginTop:12}}>
          <select className="form-input" style={{width:180}} value={filterProject} onChange={e => setFilterProject(e.target.value)}>
            <option value="">All Projects</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <select className="form-input" style={{width:160}} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>
      <div className="page-body">
        <div className="card" style={{padding:0}}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th><th>Project</th><th>Assigned To</th><th>Priority</th>
                  <th>Status</th><th>Due Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7}><div className="empty">No tasks found</div></td></tr>
                ) : filtered.map(t => (
                  <tr key={t._id}>
                    <td style={{fontWeight:500}}>{t.title}</td>
                    <td style={{color:'var(--muted)',fontSize:13}}>{t.project?.name || '—'}</td>
                    <td>{t.assignedTo?.name || <span style={{color:'var(--muted)'}}>Unassigned</span>}</td>
                    <td><span className={`badge badge-${t.priority}`}>{t.priority}</span></td>
                    <td>
                      <select
                        className="form-input"
                        style={{padding:'2px 6px',width:'auto',fontSize:12}}
                        value={t.status}
                        onChange={e => quickStatus(t._id, e.target.value)}
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </td>
                    <td className={isOverdue(t.dueDate) && t.status !== 'done' ? 'overdue' : ''}>
                      {fmt(t.dueDate)}
                    </td>
                    <td>
                      <div style={{display:'flex',gap:6}}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(t)}>Edit</button>
                        {isAdmin && <button className="btn btn-danger btn-sm" onClick={() => del(t._id)}>Del</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modal && (
        <Modal title={editing ? 'Edit Task' : 'New Task'} onClose={() => setModal(false)} onSave={save}>
          {error && <div className="error-msg">{error}</div>}
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" value={form.title} onChange={set('title')} placeholder="Task title" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={2} value={form.description} onChange={set('description')} placeholder="Optional" />
          </div>
          <div className="form-group">
            <label className="form-label">Project *</label>
            <select className="form-input" value={form.project} onChange={set('project')}>
              <option value="">Select project</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Assign To</label>
            <select className="form-input" value={form.assignedTo} onChange={set('assignedTo')}>
              <option value="">Unassigned</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-input" value={form.priority} onChange={set('priority')}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={set('status')}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input className="form-input" type="date" value={form.dueDate} onChange={set('dueDate')} />
          </div>
        </Modal>
      )}
    </>
  );
}
