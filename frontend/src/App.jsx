import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Toast from './components/Toast';

import Home      from './pages/Home';
import Login     from './pages/Login';
import Register  from './pages/Register';
import Dashboard from './pages/Dashboard';
import Alumni    from './pages/Alumni';
import Events    from './pages/Events';
import Jobs      from './pages/Jobs';
import Messages  from './pages/Messages';
import Admin     from './pages/Admin';

// Protected route: redirect to /login if not logged in
function PrivateRoute({ children, adminOnly = false }) {
  const { loggedIn, user } = useAuth();
  if (!loggedIn) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toast />
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/login"     element={<Login />} />
          <Route path="/register"  element={<Register />} />

          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/alumni"    element={<PrivateRoute><Alumni /></PrivateRoute>} />
          <Route path="/events"    element={<PrivateRoute><Events /></PrivateRoute>} />
          <Route path="/jobs"      element={<PrivateRoute><Jobs /></PrivateRoute>} />
          <Route path="/messages"  element={<PrivateRoute><Messages /></PrivateRoute>} />
          <Route path="/admin"     element={<PrivateRoute adminOnly><Admin /></PrivateRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
