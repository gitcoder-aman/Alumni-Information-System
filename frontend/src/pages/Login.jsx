import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { loggedIn, login } = useAuth();
  const navigate = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [alert,    setAlert]    = useState({ msg: '', type: '' });

  useEffect(() => {
    if (loggedIn) navigate('/dashboard');
  }, [loggedIn]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ msg: '', type: '' });

    if (!email.toLowerCase().endsWith('@uohyd.ac.in') && !email.toLowerCase().endsWith('@alumni.com')) {
      setAlert({ msg: 'Please use your University of Hyderabad email (@uohyd.ac.in) to log in.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
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
        <div className="auth-subtitle">Login to your account</div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="yourname@uohyd.ac.in"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <div className="form-text text-muted">
              Use your <strong>@uohyd.ac.in</strong> college email (admin accounts are exempt)
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="Enter password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary w-100" id="loginBtn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {alert.msg && (
            <div className={`alert-box alert-${alert.type}`} style={{ display: 'block' }}>
              {alert.msg}
            </div>
          )}
        </form>

        <hr/>
        <p className="text-center small text-muted mb-1">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
        <p className="text-center small text-muted">
          Demo Admin: <strong>admin@alumni.com</strong> / <strong>Admin@123</strong>
        </p>
      </div>
    </div>
  );
}
