import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <NavLink to="/" className="sidebar-logo">Task<span>Flow</span></NavLink>
        <nav className="sidebar-nav">
          <NavLink to="/" end className={({isActive}) => `nav-item${isActive ? ' active' : ''}`}>
            <Icon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            Dashboard
          </NavLink>
          <NavLink to="/projects" className={({isActive}) => `nav-item${isActive ? ' active' : ''}`}>
            <Icon d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            Projects
          </NavLink>
          <NavLink to="/tasks" className={({isActive}) => `nav-item${isActive ? ' active' : ''}`}>
            <Icon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            Tasks
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="user-name">{user?.name}</div>
          <div className="user-badge">{user?.role}</div>
          <button className="nav-item" onClick={handleLogout} style={{marginTop:'10px',padding:'7px 0'}}>
            <Icon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            Logout
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
