import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { loggedIn, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert]     = useState({ msg: '', type: '' });

  useEffect(() => {
    if (loggedIn) navigate('/dashboard');
  }, [loggedIn]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ msg: '', type: '' });

    if (!form.name || !form.email || !form.password) {
      setAlert({ msg: 'Please fill in all fields.', type: 'error' }); return;
    }
    if (!form.email.toLowerCase().endsWith('@uohyd.ac.in')) {
      setAlert({ msg: 'Only University of Hyderabad email addresses (@uohyd.ac.in) are allowed.', type: 'error' }); return;
    }
    if (form.password.length < 6) {
      setAlert({ msg: 'Password must be at least 6 characters.', type: 'error' }); return;
    }

    setLoading(true);
    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setAlert({ msg: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-title">Alumni Information System</div>
        <div className="auth-subtitle">Create a new account</div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input id="name" type="text" className="form-control" placeholder="Enter your full name"
              required value={form.name} onChange={set('name')} />
          </div>
          <div className="mb-3">
            <label className="form-label">College Email Address</label>
            <input id="email" type="email" className="form-control" placeholder="yourname@uohyd.ac.in"
              required value={form.email} onChange={set('email')} />
            <div className="form-text text-muted">
              Must be a University of Hyderabad email (<strong>@uohyd.ac.in</strong>)
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input id="password" type="password" className="form-control" placeholder="Minimum 6 characters"
              required value={form.password} onChange={set('password')} />
          </div>
          <div className="mb-3">
            <label className="form-label">Register as</label>
            <select id="role" className="form-select" value={form.role} onChange={set('role')}>
              <option value="student">Student</option>
              <option value="alumni">Alumni</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary w-100" id="regBtn" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
          {alert.msg && (
            <div className={`alert-box alert-${alert.type}`} style={{ display: 'block' }}>
              {alert.msg}
            </div>
          )}
        </form>

        <hr/>
        <p className="text-center small text-muted">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}
