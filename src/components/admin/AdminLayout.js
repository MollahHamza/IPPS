import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../auth';
import './Admin.css';

export default function AdminLayout() {
  const { logout } = useAuth();
  return (
    <div className="admin">
      <div className="admin-bar">
        <div className="container admin-bar__inner">
          <strong>IPPS Admin</strong>
          <nav>
            <NavLink to="/admin" end>
              Articles
            </NavLink>
            <NavLink to="/admin/new">New article</NavLink>
            <NavLink to="/admin/guide">Guide</NavLink>
            <Link to="/" target="_blank" rel="noopener noreferrer" className="admin-bar__site">
              View site ↗
            </Link>
            <button type="button" onClick={logout}>
              Log out
            </button>
          </nav>
        </div>
      </div>
      <div className="container admin__content">
        <Outlet />
      </div>
    </div>
  );
}
