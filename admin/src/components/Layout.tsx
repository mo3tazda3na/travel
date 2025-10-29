import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

const navItems = [
  { path: '/users', label: 'Users' },
  { path: '/permissions', label: 'Permissions' },
];

export const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <span className="brand">Travel Admin</span>
        </div>
        <nav>
          <ul>
            {navItems.map((item) => {
              const isActive = location.pathname.endsWith(item.path);
              return (
                <li key={item.path} className={isActive ? 'active' : ''}>
                  <Link to={item.path}>{item.label}</Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
      <div className="main">
        <header className="topbar">
          <div>
            <h1 className="topbar__title">Admin Dashboard</h1>
            <p className="topbar__subtitle">Manage users and permissions</p>
          </div>
          <div className="topbar__user">
            <div className="user-avatar">{user?.name?.[0] ?? '?'}</div>
            <div className="user-meta">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{user?.role}</span>
            </div>
            <button type="button" onClick={logout} className="btn-secondary">
              Log out
            </button>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
