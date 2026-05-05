import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

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

export default function Projects() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', members: [], status: 'active' });
  const [error, setError] = useState('');

  const load = () => {
    api.get('/projects').then(r => setProjects(r.data));
    api.get('/auth/users').then(r => setUsers(r.data));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', description: '', members: [], status: 'active' }); setModal(true); };
  const openEdit = p => { setEditing(p); setForm({ name: p.name, description: p.description || '', members: p.members.map(m => m._id), status: p.status }); setModal(true); };

  const save = async () => {
    setError('');
    try {
      if (editing) await api.put(`/projects/${editing._id}`, form);
      else await api.post('/projects', form);
      load(); setModal(false);
    } catch (e) { setError(e.response?.data?.message || 'Error'); }
  };

  const del = async id => {
    if (!window.confirm('Delete project?')) return;
    await api.delete(`/projects/${id}`); load();
  };

  const toggleMember = id => {
    setForm(f => ({ ...f, members: f.members.includes(id) ? f.members.filter(m => m !== id) : [...f.members, id] }));
  };

  return (
    <>
      <div className="page-header">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div>
            <div className="page-title">Projects</div>
            <div className="page-sub">{projects.length} project{projects.length !== 1 ? 's' : ''}</div>
          </div>
          {isAdmin && <button className="btn btn-primary" onClick={openCreate} style={{marginTop:'4px'}}>+ New Project</button>}
        </div>
      </div>
      <div className="page-body">
        <div className="card" style={{padding:0}}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>Description</th><th>Owner</th><th>Members</th><th>Status</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {projects.length === 0 ? (
                  <tr><td colSpan={6}><div className="empty">No projects yet</div></td></tr>
                ) : projects.map(p => (
                  <tr key={p._id}>
                    <td style={{fontWeight:500}}>{p.name}</td>
                    <td style={{color:'var(--muted)',maxWidth:200}}>{p.description || '—'}</td>
                    <td>{p.owner?.name}</td>
                    <td>{p.members.length} member{p.members.length !== 1 ? 's' : ''}</td>
                    <td><span className={`badge badge-${p.status === 'active' ? 'in-progress' : p.status === 'done' ? 'done' : 'todo'}`}>{p.status}</span></td>
                    {isAdmin && (
                      <td>
                        <div style={{display:'flex',gap:6}}>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => del(p._id)}>Delete</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modal && (
        <Modal title={editing ? 'Edit Project' : 'New Project'} onClose={() => setModal(false)} onSave={save}>
          {error && <div className="error-msg">{error}</div>}
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Project name" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Optional" />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Members</label>
            <div style={{border:'1px solid var(--border)',borderRadius:'var(--radius)',maxHeight:160,overflowY:'auto'}}>
              {users.map(u => (
                <label key={u._id} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 10px',cursor:'pointer',borderBottom:'1px solid var(--border)'}}>
                  <input type="checkbox" checked={form.members.includes(u._id)} onChange={() => toggleMember(u._id)} />
                  <span>{u.name}</span>
                  <span style={{marginLeft:'auto',fontSize:11,color:'var(--muted)'}}>{u.email}</span>
                </label>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
