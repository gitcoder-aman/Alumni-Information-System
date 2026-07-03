import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';

export default function HelpdeskWidget() {
  const { user } = useAuth();
  const [open, setOpen]       = useState(false);
  const [msgs, setMsgs]       = useState([]);
  const [input, setInput]     = useState('');
  const [adminId, setAdminId] = useState(null);
  const bodyRef = useRef(null);
  const intervalRef = useRef(null);

  async function initAdmin() {
    if (adminId) return adminId;
    try {
      const r = await apiFetch('/auth/admin-id');
      setAdminId(r.id);
      return r.id;
    } catch { return null; }
  }

  async function loadConv(aid) {
    const id = aid || adminId;
    if (!id) return;
    try {
      const data = await apiFetch('/messages/conversation/' + id);
      setMsgs(data);
      setTimeout(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, 50);
    } catch {}
  }

  async function handleToggle() {
    const newOpen = !open;
    setOpen(newOpen);
    if (newOpen) {
      const id = await initAdmin();
      if (id) loadConv(id);
      intervalRef.current = setInterval(() => loadConv(id), 15000);
    } else {
      clearInterval(intervalRef.current);
    }
  }

  async function handleSend() {
    const id = adminId || await initAdmin();
    if (!input.trim() || !id) return;
    try {
      await apiFetch('/messages', { method: 'POST', body: JSON.stringify({ receiver_id: id, message: input }) });
      setInput('');
      loadConv(id);
    } catch {}
  }

  useEffect(() => () => clearInterval(intervalRef.current), []);

  if (!user || user.role === 'admin') return null;

  return (
    <div id="hdWidget">
      <button className="hd-float-btn" onClick={handleToggle}>
        💬 Contact Admin
      </button>

      <div className={`hd-float-box${open ? '' : ' hd-hidden'}`}>
        <div className="hd-float-header">
          <div>
            💬 Admin Helpdesk
            <span>We'll reply as soon as possible</span>
          </div>
          <button className="hd-float-close" onClick={handleToggle}>✕</button>
        </div>
        <div className="hd-float-body" ref={bodyRef}>
          {msgs.length === 0 ? (
            <p className="hd-empty">👋 Hi {user.name}!<br/>Send a message to contact the admin helpdesk.</p>
          ) : msgs.map((m, i) => {
            const isMine = m.sender_id === user.id;
            return (
              <div key={i} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                <div className={`bubble ${isMine ? 'sent' : 'received'}`}>
                  {!isMine && <div style={{ fontSize: '0.72rem', opacity: 0.7, marginBottom: 2 }}>Admin</div>}
                  {m.message}
                  <span className="btime">
                    {new Date(m.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="hd-float-footer">
          <input
            placeholder="Type your message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
}
