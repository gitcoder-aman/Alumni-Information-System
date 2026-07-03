import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HelpdeskWidget from '../components/HelpdeskWidget';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/Toast';

export default function Messages() {
  const { user: me } = useAuth();
  const [searchParams] = useSearchParams();

  const toParam   = searchParams.get('to')   ? parseInt(searchParams.get('to')) : null;
  const nameParam = searchParams.get('name') ? decodeURIComponent(searchParams.get('name')) : '';

  const [inbox,      setInbox]      = useState([]);
  const [activeId,   setActiveId]   = useState(toParam);
  const [activeName, setActiveName] = useState(nameParam);
  const [msgs,       setMsgs]       = useState([]);
  const [chatInput,  setChatInput]  = useState('');
  const [newReceiver] = useState(toParam || '');
  const [newMsg,     setNewMsg]     = useState('');
  const chatBodyRef = useRef(null);

  useEffect(() => { loadInbox(); }, []);
  useEffect(() => {
    if (chatBodyRef.current) chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [msgs]);

  async function loadInbox() {
    try {
      const inbox = await apiFetch('/messages/inbox');
      const seen = new Map();
      inbox.forEach(m => { if (!seen.has(m.sender_id)) seen.set(m.sender_id, m); });
      const list = [...seen.values()];
      setInbox(list);
      if (toParam) openConv(toParam, nameParam, list);
    } catch (e) { console.error(e); }
  }

  async function openConv(id, name, inboxList) {
    setActiveId(id);
    setActiveName(name || 'User');
    setMsgs([]);
    try {
      const data = await apiFetch('/messages/conversation/' + id);
      setMsgs(data);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function sendMsg() {
    if (!activeId) { showToast('Select a conversation first', 'error'); return; }
    const message = chatInput.trim();
    if (!message) return;
    try {
      await apiFetch('/messages', { method: 'POST', body: JSON.stringify({ receiver_id: activeId, message }) });
      setChatInput('');
      const data = await apiFetch('/messages/conversation/' + activeId);
      setMsgs(data);
    } catch (err) { showToast(err.message, 'error'); }
  }

  async function sendNewMsg() {
    if (!newReceiver || !newMsg.trim()) { showToast('Please enter a message', 'error'); return; }
    try {
      await apiFetch('/messages', { method: 'POST', body: JSON.stringify({ receiver_id: newReceiver, message: newMsg }) });
      setNewMsg('');
      showToast('Message sent!', 'success');
      loadInbox();
      openConv(parseInt(newReceiver), activeName || ('User ' + newReceiver));
    } catch (err) { showToast(err.message, 'error'); }
  }

  return (
    <>
      <Navbar/>
      <div className="page-wrapper">
        <h2 className="page-title">Messages</h2>
        <p className="page-subtitle">Communicate with alumni or students</p>

        {/* New Message Form */}
        <div className="simple-card mb-4" id="newMsgCard">
          <h5 className="fw-bold mb-3">Send a New Message</h5>

          {toParam && (
            <div className="mb-3 px-3 py-2 rounded d-flex align-items-center gap-2"
              style={{ background: 'linear-gradient(90deg,#e8f0fe,#d2e3fc)', borderLeft: '4px solid #1a73e8' }}>
              <span style={{ fontSize: '1.2rem' }}>💬</span>
              <span>Sending message to: <strong>{nameParam}</strong></span>
            </div>
          )}

          <div className="row g-2 align-items-end">
            <div className="col-sm-3">
              <label className="form-label">Recipient User ID</label>
              <input className="form-control" type="number" placeholder="Enter user ID"
                style={{ background: '#f1f3f4', cursor: 'not-allowed' }} readOnly value={newReceiver || ''} />
            </div>
            <div className="col-sm-7">
              <label className="form-label">Message</label>
              <input className="form-control" placeholder="Type your message here..."
                value={newMsg} onChange={e => setNewMsg(e.target.value)} />
            </div>
            <div className="col-sm-2">
              <button className="btn btn-primary w-100" onClick={sendNewMsg}>Send</button>
            </div>
          </div>
          {!toParam && (
            <p className="text-muted small mt-2">
              Go to the <a href="/alumni">Alumni Directory</a> and click <strong>Message</strong> next to any alumni to start a conversation.
            </p>
          )}
        </div>

        {/* Inbox + Chat */}
        <div className="msg-layout">
          {/* Inbox Panel */}
          <div className="contacts-panel">
            <div style={{ background: '#1a73e8', color: '#fff', padding: '10px 14px', fontWeight: 600, fontSize: '0.9rem', borderRadius: '8px 8px 0 0' }}>
              Inbox
            </div>
            <div id="contactsList">
              {inbox.length === 0 ? (
                <p className="empty-msg" style={{ fontSize: '0.85rem' }}>No messages yet.</p>
              ) : inbox.map(m => (
                <div key={m.sender_id}
                  className={`contact-row ${m.sender_id === activeId ? 'active' : ''}`}
                  id={`contact-${m.sender_id}`}
                  onClick={() => openConv(m.sender_id, m.sender_name)}>
                  <div className="fw-bold" style={{ fontSize: '0.88rem' }}>{m.sender_name}</div>
                  <div className="text-muted" style={{ fontSize: '0.76rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
                    {m.message}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Panel */}
          <div className="chat-panel">
            <div className="chat-header" id="chatHeader">
              {activeId ? `Chat with: ${activeName}` : 'Select a conversation'}
            </div>
            <div className="chat-body" id="chatBody" ref={chatBodyRef}>
              {!activeId ? (
                <p className="empty-msg">Select a conversation from the inbox to start chatting.</p>
              ) : msgs.length === 0 ? (
                <p className="empty-msg">No messages yet. Say hello!</p>
              ) : msgs.map((m, i) => {
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
            {activeId && (
              <div className="chat-footer" id="chatFooter" style={{ display: 'flex' }}>
                <input id="chatInput" className="form-control" placeholder="Type a message..."
                  value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMsg()} />
                <button className="btn btn-primary" onClick={sendMsg}>Send</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <HelpdeskWidget/>
    </>
  );
}
