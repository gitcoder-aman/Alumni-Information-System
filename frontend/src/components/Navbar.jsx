import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const role = user?.role;

  const links = [
    { to: '/dashboard', label: 'Dashboard', roles: ['admin', 'student', 'alumni'] },
    { to: '/alumni',    label: 'Alumni',    roles: ['admin', 'student', 'alumni'] },
    { to: '/events',    label: 'Events',    roles: ['admin', 'student', 'alumni'] },
    { to: '/jobs',      label: 'Jobs',      roles: ['admin', 'student', 'alumni'] },
    { to: '/messages',  label: 'Messages',  roles: ['admin', 'student', 'alumni'] },
    { to: '/admin',     label: 'Admin',     roles: ['admin'] },
  ].filter(l => l.roles.includes(role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav id="main-navbar" className="navbar navbar-expand-lg">
      <div className="container">
        <a className="navbar-brand" href="/dashboard" onClick={e => { e.preventDefault(); navigate('/dashboard'); }}>
          Alumni System
        </a>
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setMenuOpen(v => !v)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse${menuOpen ? ' show' : ''}`} id="navMenu">
          <ul className="navbar-nav me-auto">
            {links.map(l => (
              <li className="nav-item" key={l.to}>
                <NavLink
                  className={({ isActive }) => `nav-link${isActive ? ' active fw-bold text-white' : ''}`}
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="d-flex align-items-center gap-3">
            <span className="text-white-50" style={{ fontSize: '0.85rem' }}>
              {user?.name} ({role})
            </span>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
