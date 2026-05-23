import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '◉' },
  { id: 'transactions', label: 'Transactions', icon: '⇄' },
  { id: 'charts', label: 'Charts', icon: '▦' },
  { id: 'monthly', label: 'Monthly', icon: '▤' },
];

export default function Sidebar({ page, setPage }) {
  const { user, logout } = useAuth();
  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">flo</div>
      <nav className="sidebar-nav">
        {NAV.map(n => (
          <button
            key={n.id}
            className={`nav-item ${page === n.id ? 'active' : ''}`}
            onClick={() => setPage(n.id)}
          >
            <span className="nav-icon">{n.icon}</span>
            <span>{n.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{initials}</div>
          <div className="user-details">
            <span className="user-name">{user?.name}</span>
            <span className="user-email">{user?.email}</span>
          </div>
        </div>
        <button className="logout-btn" onClick={logout} title="Sign out">⏻</button>
      </div>
    </aside>
  );
}
