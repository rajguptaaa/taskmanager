import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handle = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await signup(form.name, form.email, form.password, form.role); navigate('/'); }
    catch (e) { setError(e.response?.data?.message || 'Signup failed'); }
    finally { setLoading(false); }
  };

  const set = k => e => setForm({...form, [k]: e.target.value});

  return (
    <div className="auth-wrap">
      <div className="auth-box">
        <div className="auth-logo">Task<span>Flow</span></div>
        <div className="auth-sub">Create your account</div>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handle}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="form-input" required value={form.name} onChange={set('name')} placeholder="Your name" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" required value={form.email} onChange={set('email')} placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" required value={form.password} onChange={set('password')} placeholder="Min. 6 characters" />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-input" value={form.role} onChange={set('role')}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button className="btn btn-primary" type="submit" style={{width:'100%',justifyContent:'center',marginTop:'6px'}} disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <div className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></div>
      </div>
    </div>
  );
}
