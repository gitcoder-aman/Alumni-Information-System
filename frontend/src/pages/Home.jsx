import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

export default function Home() {
  const { loggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loggedIn) navigate('/dashboard');
  }, [loggedIn]);

  return (
    <>
      <nav className="navbar navbar-expand-lg">
        <div className="container">
          <span className="navbar-brand">Alumni Information System</span>
          <div className="ms-auto d-flex gap-2">
            <Link to="/login"    className="btn btn-outline-light btn-sm">Login</Link>
            <Link to="/register" className="btn btn-light btn-sm">Register</Link>
          </div>
        </div>
      </nav>

      <div className="container py-5">
        {/* Welcome Banner */}
        <div className="text-center mb-5">
          <h1 className="fw-bold" style={{ color: '#1a73e8' }}>
            Welcome to the Alumni Information System
          </h1>
          <p className="text-muted fs-5">A platform connecting alumni, students and the institution.</p>
          <div className="mt-3 d-flex gap-3 justify-content-center">
            <Link to="/register" className="btn btn-primary px-4">Get Started</Link>
            <Link to="/login"    className="btn btn-outline-primary px-4">Login</Link>
          </div>
        </div>

        <hr className="my-4"/>

        {/* Features */}
        <h4 className="fw-bold mb-3 text-center">What this system offers</h4>
        <div className="row g-3 text-center">
          {[
            { icon: '👤', title: 'Alumni Profiles',    desc: 'View alumni with their company, batch and department information.' },
            { icon: '📅', title: 'Events',             desc: 'Stay updated about college events, reunions and seminars.' },
            { icon: '💼', title: 'Jobs & Internships', desc: 'Alumni share job and internship opportunities for students.' },
            { icon: '💬', title: 'Messaging',          desc: 'Students can directly message alumni for guidance and mentorship.' },
            { icon: '🔍', title: 'Search Alumni',      desc: 'Filter alumni by name, graduation batch or department.' },
            { icon: '🔒', title: 'Role-Based Access',  desc: 'Admin, Alumni and Student roles with different permissions.' },
          ].map(f => (
            <div className="col-sm-6 col-md-4" key={f.title}>
              <div className="simple-card h-100">
                <div className="fs-2 mb-2">{f.icon}</div>
                <h6 className="fw-bold">{f.title}</h6>
                <p className="text-muted small">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <hr className="my-5"/>
        <p className="text-center text-muted small">
          Mini Project &mdash; Alumni Information System &mdash; Node.js + PostgreSQL
        </p>
      </div>
    </>
  );
}
