import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HelpdeskWidget from '../components/HelpdeskWidget';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats,           setStats]          = useState({ totalAlumni: '–', totalStudents: '–', totalEvents: '–', totalJobs: '–' });
  const [upcomingEvents,  setUpcomingEvents]  = useState(null);
  const [completedEvents, setCompletedEvents] = useState(null);
  const [jobs,            setJobs]            = useState(null);
  const [myProfile,       setMyProfile]       = useState(null);

  useEffect(() => {
    // Stats
    const endpoint = user.role === 'admin' ? '/admin/dashboard' : '/alumni/stats';
    apiFetch(endpoint).then(s => setStats({
      totalAlumni:   s.totalAlumni,
      totalStudents: s.totalStudents,
      totalEvents:   s.totalEvents,
      totalJobs:     s.totalJobs,
    })).catch(console.error);

    // Events
    apiFetch('/events').then(events => {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const upcoming  = events.filter(ev => new Date(ev.event_date) >= today)
                              .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
      const completed = events.filter(ev => new Date(ev.event_date) < today)
                              .sort((a, b) => new Date(b.event_date) - new Date(a.event_date));
      setUpcomingEvents(upcoming);
      setCompletedEvents(completed);
    }).catch(() => { setUpcomingEvents([]); setCompletedEvents([]); });

    // Jobs
    apiFetch('/jobs').then(setJobs).catch(() => setJobs([]));

    // My profile (alumni)
    if (user.role === 'alumni') {
      apiFetch('/alumni/profile/me').then(setMyProfile).catch(() => {});
    }
  }, []);

  return (
    <>
      <Navbar/>
      <div className="page-wrapper">
        <h2 className="page-title" id="greeting">Welcome, {user.name}</h2>
        <p className="page-subtitle" id="roleInfo">
          Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </p>

        {/* Stats */}
        <div className="row g-3 mb-4">
          {[
            { id: 'statAlumni',   label: 'Total Alumni',   val: stats.totalAlumni },
            { id: 'statStudents', label: 'Total Students', val: stats.totalStudents },
            { id: 'statEvents',   label: 'Events',         val: stats.totalEvents },
            { id: 'statJobs',     label: 'Job Postings',   val: stats.totalJobs },
          ].map(s => (
            <div className="col-6 col-md-3" key={s.id}>
              <div className="stat-box">
                <div className="stat-number" id={s.id}>{s.val}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-4">
          {/* Events Column */}
          <div className="col-md-6">
            {/* Upcoming Events */}
            <div className="simple-card mb-3">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fw-bold mb-0">🗓️ Upcoming Events</h5>
                <Link to="/events" className="btn btn-outline-primary btn-sm">View All</Link>
              </div>
              <div id="upcomingEventsList">
                {upcomingEvents === null ? (
                  <p className="loader">Loading...</p>
                ) : upcomingEvents.length === 0 ? (
                  <p className="text-muted small">No upcoming events.</p>
                ) : upcomingEvents.slice(0, 4).map(ev => (
                  <div key={ev.id} className="border-bottom pb-2 mb-2" style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ background: '#e8f0fe', color: '#1a73e8', borderRadius: 8, padding: '4px 8px', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap', minWidth: 48, textAlign: 'center' }}>
                      {new Date(ev.event_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </div>
                    <div>
                      <div className="fw-bold small">{ev.title}</div>
                      <div className="text-muted" style={{ fontSize: '0.78rem' }}>{ev.location || 'TBD'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Completed Events */}
            <div className="simple-card">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fw-bold mb-0">✅ Completed Events</h5>
                <span id="completedCount" className="badge" style={{ background: '#e6f4ea', color: '#188038', fontSize: '0.78rem', padding: '4px 10px', borderRadius: 12 }}>
                  {completedEvents?.length ?? 0}
                </span>
              </div>
              <div id="completedEventsList">
                {completedEvents === null ? (
                  <p className="loader">Loading...</p>
                ) : completedEvents.length === 0 ? (
                  <p className="text-muted small">No completed events yet.</p>
                ) : completedEvents.slice(0, 5).map(ev => (
                  <div key={ev.id} className="border-bottom pb-2 mb-2" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, opacity: 0.75 }}>
                    <div style={{ background: '#e6f4ea', color: '#188038', borderRadius: 8, padding: '4px 8px', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap', minWidth: 48, textAlign: 'center' }}>
                      ✓ Done
                    </div>
                    <div>
                      <div className="fw-bold small" style={{ textDecoration: 'line-through', color: '#666' }}>{ev.title}</div>
                      <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                        {new Date(ev.event_date).toLocaleDateString('en-IN')} &bull; {ev.location || 'TBD'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Jobs */}
          <div className="col-md-6">
            <div className="simple-card">
              <h5 className="fw-bold mb-3">Latest Job Postings</h5>
              <div id="jobsList">
                {jobs === null ? (
                  <p className="loader">Loading...</p>
                ) : jobs.length === 0 ? (
                  <p className="text-muted small">No job postings yet.</p>
                ) : jobs.slice(0, 4).map(j => (
                  <div key={j.id} className="border-bottom pb-2 mb-2">
                    <div className="fw-bold small">{j.role} – {j.company}</div>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>{j.type} &bull; {j.location || 'Remote'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* My Profile (alumni only) */}
        {user.role === 'alumni' && (
          <div id="myProfileSection" className="mt-4">
            <div className="simple-card">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">My Profile</h5>
                <Link to="/alumni" className="btn btn-outline-primary btn-sm">Edit Profile</Link>
              </div>
              <div id="myProfileContent">
                {myProfile ? (
                  <div className="row g-2" style={{ fontSize: '0.9rem' }}>
                    <div className="col-sm-4"><span className="text-muted">Department:</span> <strong>{myProfile.department || '–'}</strong></div>
                    <div className="col-sm-4"><span className="text-muted">Batch:</span> <strong>{myProfile.graduation_year || '–'}</strong></div>
                    <div className="col-sm-4"><span className="text-muted">Company:</span> <strong>{myProfile.company || '–'}</strong></div>
                    <div className="col-sm-4"><span className="text-muted">Designation:</span> <strong>{myProfile.designation || '–'}</strong></div>
                    <div className="col-sm-4"><span className="text-muted">Location:</span> <strong>{myProfile.location || '–'}</strong></div>
                  </div>
                ) : (
                  <p className="text-muted small">Loading...</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <HelpdeskWidget/>
    </>
  );
}
