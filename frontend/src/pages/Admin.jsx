import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/Toast';

export default function Admin() {
  const { user: me } = useAuth();
  const [stats, setStats]           = useState({ totalUsers: '–', totalAlumni: '–', totalStudents: '–', totalEvents: '–', totalJobs: '–', totalMessages: '–' });
  const [allUsers, setAllUsers]     = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');

  // Helpdesk state
  const [hdSenders, setHdSenders]         = useState([]);
  const [hdActiveId, setHdActiveId]       = useState(null);
  const [hdActiveName, setHdActiveName]   = useState('');
  const [hdActiveRole, setHdActiveRole]   = useState('');
  const [hdMsgs, setHdMsgs]               = useState([]);
  const [hdReply, setHdReply]             = useState('');
  const [showNewConv, setShowNewConv]     = useState(false);
  const [hdAllNonAdmin, setHdAllNonAdmin] = useState([]);
  const [hdUserSearch, setHdUserSearch]   = useState('');
  const [hdFilteredPick, setHdFilteredPick] = useState([]);
  const hdBodyRef = useRef(null);

  // ── Stats ──
  useEffect(() => {
    apiFetch('/admin/dashboard').then(s => setStats({
      totalUsers:    s.totalUsers,
      totalAlumni:   s.totalAlumni,
      totalStudents: s.totalStudents,
      totalEvents:   s.totalEvents,
      totalJobs:     s.totalJobs,
      totalMessages: s.totalMessages,
    })).catch(err => showToast('Failed to load stats: ' + err.message, 'error'));

    loadUsers();
    loadHelpdesk();
    const interval = setInterval(loadHelpdesk, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (hdBodyRef.current) hdBodyRef.current.scrollTop = hdBodyRef.current.scrollHeight;
  }, [hdMsgs]);

  // ── Users ──
  async function loadUsers() {
    try {
      const users = await apiFetch('/admin/users');
      setAllUsers(users);
      setFilteredUsers(users);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  function filterUsers(q) {
    setUserSearch(q);
    const lower = q.toLowerCase();
    setFilteredUsers(allUsers.filter(u => u.name.toLowerCase().includes(lower) || u.email.toLowerCase().includes(lower)));
  }

  async function updateRole(id, role) {
    try {
      await apiFetch('/admin/users/' + id + '/role', { method: 'PUT', body: JSON.stringify({ role }) });
      showToast('Role updated!', 'success');
      loadUsers();
    } catch (err) { showToast(err.message, 'error'); }
  }

  async function deleteUser(id, name) {
    if (!confirm('Delete user "' + name + '"? This cannot be undone.')) return;
    try {
      await apiFetch('/admin/users/' + id, { method: 'DELETE' });
      showToast('User deleted', 'success');
      loadUsers();
    } catch (err) { showToast(err.message, 'error'); }
  }

  // ── Helpdesk ──
  async function loadHelpdesk() {
    try {
      const senders = await apiFetch('/admin/helpdesk');
      setHdSenders(senders);
    } catch (err) {
      console.error(err);
    }
  }

  async function hdOpenConv(userId, name, role) {
    setHdActiveId(userId);
    setHdActiveName(name);
    setHdActiveRole(role);
    setHdMsgs([]);
    try {
      const msgs = await apiFetch('/admin/helpdesk/' + userId);
      setHdMsgs(msgs);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function hdSendReply() {
    if (!hdActiveId || !hdReply.trim()) return;
    try {
      await apiFetch('/messages', { method: 'POST', body: JSON.stringify({ receiver_id: hdActiveId, message: hdReply }) });
      setHdReply('');
      hdOpenConv(hdActiveId, hdActiveName, hdActiveRole);
    } catch (err) { showToast(err.message, 'error'); }
  }

  async function toggleNewConv() {
    const newVisible = !showNewConv;
    setShowNewConv(newVisible);
    if (newVisible) {
      setHdUserSearch('');
      try {
        const users = await apiFetch('/admin/users');
        const nonAdmin = users.filter(u => u.role !== 'admin');
        setHdAllNonAdmin(nonAdmin);
        setHdFilteredPick(nonAdmin);
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  }

  function filterHdUsers(q) {
    setHdUserSearch(q);
    const lower = q.toLowerCase();
    setHdFilteredPick(hdAllNonAdmin.filter(u => u.name.toLowerCase().includes(lower) || u.role.toLowerCase().includes(lower)));
  }

  function hdPickUser(id, name, role) {
    setShowNewConv(false);
    hdOpenConv(id, name, role);
    // Add to senders list if not already there
    if (!hdSenders.find(u => u.id === id)) {
      setHdSenders(prev => [{ id, name, role, unread_count: 0 }, ...prev]);
    }
  }

  return (
    <>
      <Navbar/>
      <div className="page-wrapper">
        <h2 className="page-title">Admin Panel</h2>
        <p className="page-subtitle">Manage users, view statistics and control the system</p>

        {/* Stats */}
        <div className="row g-3 mb-4">
          {[
            { id: 's_users',    label: 'Total Users', val: stats.totalUsers },
            { id: 's_alumni',   label: 'Alumni',      val: stats.totalAlumni },
            { id: 's_students', label: 'Students',    val: stats.totalStudents },
            { id: 's_events',   label: 'Events',      val: stats.totalEvents },
            { id: 's_jobs',     label: 'Jobs',        val: stats.totalJobs },
            { id: 's_msgs',     label: 'Messages',    val: stats.totalMessages },
          ].map(s => (
            <div className="col-6 col-md-2" key={s.id}>
              <div className="stat-box">
                <div className="stat-number" id={s.id}>{s.val}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Two-column layout */}
        <div className="admin-layout">

          {/* LEFT COLUMN */}
          <div>
            {/* Quick Links */}
            <div className="simple-card mb-4">
              <h5 className="fw-bold mb-3">Quick Links</h5>
              <div className="d-flex gap-2 flex-wrap">
                <a href="/events"   className="btn btn-outline-primary btn-sm">Manage Events</a>
                <a href="/jobs"     className="btn btn-outline-primary btn-sm">Manage Jobs</a>
                <a href="/alumni"   className="btn btn-outline-primary btn-sm">View Alumni</a>
                <a href="/messages" className="btn btn-outline-primary btn-sm">Messages</a>
              </div>
            </div>

            {/* User Management */}
            <div className="simple-card">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <h5 className="fw-bold mb-0">User Management</h5>
                <input
                  id="userSearch"
                  className="form-control"
                  style={{ maxWidth: 240 }}
                  placeholder="Search name or email..."
                  value={userSearch}
                  onChange={e => filterUsers(e.target.value)}
                />
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="simple-table" id="usersTable">
                  <thead>
                    <tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr>
                  </thead>
                  <tbody id="usersTbody">
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan="6" style={{ textAlign: 'center', padding: 20, color: '#999' }}>
                        {allUsers.length === 0 ? 'Loading...' : 'No users found.'}
                      </td></tr>
                    ) : filteredUsers.map((u, i) => (
                      <tr key={u.id}>
                        <td>{i + 1}</td>
                        <td><strong>{u.name}</strong></td>
                        <td>{u.email}</td>
                        <td><span className={`role-badge role-${u.role}`}>{u.role.toUpperCase()}</span></td>
                        <td>{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                        <td>
                          {u.id !== me.id ? (
                            <div className="d-flex align-items-center gap-1 flex-wrap">
                              <RoleSelect userId={u.id} currentRole={u.role} onSave={updateRole} />
                              <button className="btn btn-outline-danger btn-sm" onClick={() => deleteUser(u.id, u.name)}>Delete</button>
                            </div>
                          ) : (
                            <span className="text-muted small">(You)</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Helpdesk Chat Panel */}
          <div className="helpdesk-panel">
            <div className="helpdesk-header">
              <span className="hd-dot"></span>
              💬 Helpdesk – User Messages
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                <button
                  id="hdNewConvBtn"
                  onClick={toggleNewConv}
                  title="Start a new conversation"
                  style={{ background: 'rgba(255,255,255,0.25)', border: 'none', color: '#fff', borderRadius: 6, padding: '2px 9px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                >＋ New</button>
                <button
                  id="hdRefreshBtn"
                  onClick={loadHelpdesk}
                  title="Refresh"
                  style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 6, padding: '2px 8px', cursor: 'pointer', fontSize: '0.8rem' }}
                >↻</button>
              </div>
            </div>

            {/* New Conversation picker */}
            {showNewConv && (
              <div id="hdNewConvPanel" style={{ padding: '10px 12px', background: '#f8faff', borderBottom: '1px solid #dde5f8' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1a73e8', marginBottom: 6 }}>Start a new conversation with:</div>
                <input
                  id="hdUserSearch"
                  className="form-control form-control-sm"
                  placeholder="Search by name or role (student/alumni)…"
                  value={hdUserSearch}
                  onChange={e => filterHdUsers(e.target.value)}
                  style={{ marginBottom: 6 }}
                  autoFocus
                />
                <div id="hdUserPickList" style={{ maxHeight: 160, overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: 6, background: '#fff' }}>
                  {hdFilteredPick.length === 0 ? (
                    <p className="hd-empty" style={{ fontSize: '0.78rem' }}>No users found.</p>
                  ) : hdFilteredPick.map(u => (
                    <div key={u.id}
                      onClick={() => hdPickUser(u.id, u.name, u.role)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0', background: '#fff' }}
                      onMouseOver={e => e.currentTarget.style.background = '#eef3fd'}
                      onMouseOut={e => e.currentTarget.style.background = '#fff'}
                    >
                      <div className="hd-avatar" style={{ width: 28, height: 28, fontSize: '0.72rem', flexShrink: 0 }}>{u.name.charAt(0).toUpperCase()}</div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#888' }}>{u.role} · {u.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Senders list */}
            <div className="helpdesk-users" id="hdUsersList">
              {hdSenders.length === 0 ? (
                <p className="hd-empty">No messages yet. Use <strong>＋ New</strong> to start a conversation.</p>
              ) : hdSenders.map(u => (
                <div key={u.id}
                  className={`hd-user-row ${u.id === hdActiveId ? 'active' : ''}`}
                  id={`hd-user-${u.id}`}
                  onClick={() => hdOpenConv(u.id, u.name, u.role)}
                >
                  <div className="hd-avatar">{u.name.charAt(0).toUpperCase()}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.84rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</div>
                    <div style={{ fontSize: '0.74rem', color: '#888' }}>{u.role}</div>
                  </div>
                  {u.unread_count > 0 && <span className="hd-badge">{u.unread_count}</span>}
                </div>
              ))}
            </div>

            {/* Chat title */}
            <div id="hdChatTitle" style={{ padding: '8px 14px', fontSize: '0.82rem', fontWeight: 600, color: '#1a73e8', background: '#eef3fd', borderBottom: '1px solid #dde5f8' }}>
              {hdActiveId ? `💬 ${hdActiveName}${hdActiveRole ? ' (' + hdActiveRole + ')' : ''}` : 'Select a user to view conversation'}
            </div>

            {/* Messages */}
            <div className="hd-chat-body" id="hdChatBody" ref={hdBodyRef}>
              {!hdActiveId ? (
                <p className="hd-empty">👈 Choose a user from above</p>
              ) : hdMsgs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 16px', color: '#888' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>💬</div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>No messages yet</div>
                  <div style={{ fontSize: '0.82rem' }}>You're starting a new conversation with <strong>{hdActiveName}</strong>.<br/>Type your message below and press Send.</div>
                </div>
              ) : hdMsgs.map((m, i) => {
                const isMine = m.sender_id === me.id;
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                    <div className={`bubble ${isMine ? 'sent' : 'received'}`}>
                      {m.message}
                      <span className="btime">
                        {new Date(m.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply footer */}
            {hdActiveId && (
              <div className="hd-chat-footer" id="hdChatFooter">
                <input
                  id="hdReplyInput"
                  placeholder="Type a reply..."
                  value={hdReply}
                  onChange={e => setHdReply(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && hdSendReply()}
                />
                <button onClick={hdSendReply}>Send</button>
              </div>
            )}
          </div>

        </div>{/* end admin-layout */}
      </div>
    </>
  );
}

// Separate sub-component to manage per-row role select state
function RoleSelect({ userId, currentRole, onSave }) {
  const [role, setRole] = useState(currentRole);
  return (
    <>
      <select
        className="form-select form-select-sm"
        style={{ width: 110 }}
        id={`role-${userId}`}
        value={role}
        onChange={e => setRole(e.target.value)}
      >
        <option value="student">Student</option>
        <option value="alumni">Alumni</option>
        <option value="admin">Admin</option>
      </select>
      <button className="btn btn-outline-success btn-sm" onClick={() => onSave(userId, role)}>Save</button>
    </>
  );
}
