import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import HelpdeskWidget from '../components/HelpdeskWidget';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/Toast';

const emptyForm = { title: '', event_date: '', location: '', description: '' };

export default function Events() {
  const { user } = useAuth();
  const [events,      setEvents]      = useState(null);
  const [showForm,    setShowForm]    = useState(false);
  const [formTitle,   setFormTitle]   = useState('Add Event');
  const [editId,      setEditId]      = useState('');
  const [form,        setForm]        = useState(emptyForm);

  useEffect(() => { loadEvents(); }, []);

  async function loadEvents() {
    setEvents(null);
    try { setEvents(await apiFetch('/events')); }
    catch { setEvents([]); }
  }

  function openForm(ev = null) {
    setEditId(ev ? ev.id : '');
    setForm(ev ? {
      title:       ev.title       || '',
      event_date:  ev.event_date?.split('T')[0] || '',
      location:    ev.location    || '',
      description: ev.description || '',
    } : emptyForm);
    setFormTitle(ev ? 'Edit Event' : 'Add Event');
    setShowForm(true);
  }

  function closeForm() { setShowForm(false); }

  async function saveEvent() {
    if (!form.title || !form.event_date) { showToast('Title and date are required', 'error'); return; }
    try {
      if (editId) {
        await apiFetch('/events/' + editId, { method: 'PUT', body: JSON.stringify(form) });
        showToast('Event updated!', 'success');
      } else {
        await apiFetch('/events', { method: 'POST', body: JSON.stringify(form) });
        showToast('Event created!', 'success');
      }
      closeForm();
      loadEvents();
    } catch (err) { showToast(err.message, 'error'); }
  }

  async function deleteEvent(id) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await apiFetch('/events/' + id, { method: 'DELETE' });
      showToast('Event deleted', 'success');
      loadEvents();
    } catch (err) { showToast(err.message, 'error'); }
  }

  const setF = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const isAdmin = user.role === 'admin';

  return (
    <>
      <Navbar/>
      <div className="page-wrapper">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div>
            <h2 className="page-title mb-0">Events</h2>
            <p className="page-subtitle mb-0">College events, reunions and seminars</p>
          </div>
          {isAdmin && (
            <button id="btnCreate" className="btn btn-primary" onClick={() => openForm()}>+ Add Event</button>
          )}
        </div>

        {/* Create / Edit Form */}
        {showForm && (
          <div id="eventForm" className="simple-card mb-4">
            <h5 className="fw-bold mb-3" id="formTitle">{formTitle}</h5>
            <div className="row g-2">
              <div className="col-sm-8">
                <label className="form-label">Event Title *</label>
                <input className="form-control" placeholder="e.g. Annual Alumni Meet 2024"
                  value={form.title} onChange={setF('title')} />
              </div>
              <div className="col-sm-4">
                <label className="form-label">Date *</label>
                <input type="date" className="form-control" value={form.event_date} onChange={setF('event_date')} />
              </div>
              <div className="col-sm-6">
                <label className="form-label">Location</label>
                <input className="form-control" placeholder="e.g. Main Auditorium"
                  value={form.location} onChange={setF('location')} />
              </div>
              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows="2" placeholder="Brief description of the event"
                  value={form.description} onChange={setF('description')} />
              </div>
              <div className="col-12 d-flex gap-2">
                <button className="btn btn-success" onClick={saveEvent}>Save</button>
                <button className="btn btn-secondary" onClick={closeForm}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Events Table */}
        <div id="eventsContainer">
          {events === null ? (
            <p className="loader">Loading events...</p>
          ) : events.length === 0 ? (
            <p className="empty-msg">No events found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="simple-table">
                <thead>
                  <tr>
                    <th>#</th><th>Title</th><th>Date</th><th>Location</th><th>Description</th>
                    {isAdmin && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev, i) => (
                    <tr key={ev.id}>
                      <td>{i + 1}</td>
                      <td><strong>{ev.title}</strong></td>
                      <td>{new Date(ev.event_date).toLocaleDateString('en-IN')}</td>
                      <td>{ev.location || '–'}</td>
                      <td>{ev.description ? ev.description.slice(0, 60) + (ev.description.length > 60 ? '...' : '') : '–'}</td>
                      {isAdmin && (
                        <td>
                          <button className="btn btn-outline-primary btn-sm me-1" onClick={() => openForm(ev)}>Edit</button>
                          <button className="btn btn-outline-danger btn-sm" onClick={() => deleteEvent(ev.id)}>Delete</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <HelpdeskWidget/>
    </>
  );
}
