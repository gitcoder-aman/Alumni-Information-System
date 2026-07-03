import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HelpdeskWidget from '../components/HelpdeskWidget';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/Toast';

function initials(name) {
  return (name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function Alumni() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [alumni, setAlumni]   = useState(null);
  const [filter, setFilter]   = useState({ name: '', batch: '', department: '' });
  const [profile, setProfile] = useState(null); // modal
  const [showModal, setShowModal] = useState(false);
  const [editForm, setEditForm]   = useState({
    graduation_year: '', department: '', company: '', designation: '', location: '', linkedin: '', bio: ''
  });
  const [profileAlert, setProfileAlert] = useState({ msg: '', type: '' });

  useEffect(() => {
    loadAlumni();
    if (user.role === 'alumni') {
      apiFetch('/alumni/profile/me').then(p => {
        if (!p) return;
        setEditForm({
          graduation_year: p.graduation_year || '',
          department:      p.department      || '',
          company:         p.company         || '',
          designation:     p.designation     || '',
          location:        p.location        || '',
          linkedin:        p.linkedin        || '',
          bio:             p.bio             || '',
        });
      }).catch(() => {});
    }
  }, []);

  async function loadAlumni(params = '') {
    setAlumni(null);
    try {
      const list = await apiFetch('/alumni' + (params ? '?' + params : ''));
      setAlumni(list);
    } catch (err) {
      setAlumni([]);
    }
  }

  function searchAlumni() {
    const p = new URLSearchParams();
    if (filter.name)       p.set('name', filter.name);
    if (filter.batch)      p.set('batch', filter.batch);
    if (filter.department) p.set('department', filter.department);
    loadAlumni(p.toString());
  }

  function resetSearch() {
    setFilter({ name: '', batch: '', department: '' });
    loadAlumni();
  }

  async function saveProfile() {
    const body = { ...editForm, graduation_year: parseInt(editForm.graduation_year) || null };
    try {
      await apiFetch('/alumni/profile', { method: 'PUT', body: JSON.stringify(body) });
      setProfileAlert({ msg: 'Profile updated successfully!', type: 'success' });
      loadAlumni();
    } catch (err) {
      setProfileAlert({ msg: err.message, type: 'error' });
    }
  }

  async function viewProfile(id) {
    setProfile(null);
    setShowModal(true);
    try {
      const a = await apiFetch('/alumni/' + id);
      setProfile(a);
    } catch (err) {
      setProfile({ error: err.message });
    }
  }

  function msgAlumni(id, name) {
    navigate(`/messages?to=${id}&name=${encodeURIComponent(name)}`);
  }

  const setEdit = (k) => (e) => setEditForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <>
      <Navbar/>
      <div className="page-wrapper">
        <h2 className="page-title">Alumni Directory</h2>
        <p className="page-subtitle">Search alumni by name, batch year or department</p>

        {/* Search Form */}
        <div className="simple-card mb-4">
          <div className="row g-2 align-items-end">
            <div className="col-sm-4">
              <label className="form-label">Name</label>
              <input className="form-control" placeholder="Search by name"
                value={filter.name} onChange={e => setFilter(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="col-sm-3">
              <label className="form-label">Batch Year</label>
              <input type="number" className="form-control" placeholder="e.g. 2022"
                value={filter.batch} onChange={e => setFilter(f => ({ ...f, batch: e.target.value }))} />
            </div>
            <div className="col-sm-3">
              <label className="form-label">Department</label>
              <input className="form-control" placeholder="e.g. Computer Sci"
                value={filter.department} onChange={e => setFilter(f => ({ ...f, department: e.target.value }))} />
            </div>
            <div className="col-sm-2 d-flex gap-2">
              <button className="btn btn-primary w-100" onClick={searchAlumni}>Search</button>
            </div>
          </div>
          <div className="mt-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={resetSearch}>Clear Filters</button>
          </div>
        </div>

        {/* Edit Profile (alumni only) */}
        {user.role === 'alumni' && (
          <div id="editProfileSection" className="simple-card mb-4">
            <h5 className="fw-bold mb-3">Update My Profile</h5>
            <div className="row g-2">
              {[
                { label: 'Graduation Year', key: 'graduation_year', type: 'number', ph: '2022' },
                { label: 'Department',      key: 'department',      ph: 'Computer Science' },
                { label: 'Company',         key: 'company',         ph: 'Google Inc.' },
                { label: 'Designation',     key: 'designation',     ph: 'Software Engineer' },
                { label: 'Location',        key: 'location',        ph: 'Bangalore, India' },
                { label: 'LinkedIn URL',    key: 'linkedin',        ph: 'https://linkedin.com/in/...' },
              ].map(f => (
                <div className="col-sm-4" key={f.key}>
                  <label className="form-label">{f.label}</label>
                  <input className="form-control" type={f.type || 'text'} placeholder={f.ph}
                    value={editForm[f.key]} onChange={setEdit(f.key)} />
                </div>
              ))}
              <div className="col-12">
                <label className="form-label">Bio</label>
                <textarea className="form-control" rows="2" placeholder="Tell students about your journey..."
                  value={editForm.bio} onChange={setEdit('bio')} />
              </div>
              <div className="col-12">
                <button className="btn btn-success" onClick={saveProfile}>Save Profile</button>
                {profileAlert.msg && (
                  <div className={`alert-box alert-${profileAlert.type} mt-2`} style={{ display: 'block' }}>
                    {profileAlert.msg}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Alumni List */}
        <div id="alumniList">
          {alumni === null ? (
            <p className="loader">Loading alumni...</p>
          ) : alumni.length === 0 ? (
            <p className="empty-msg">No alumni found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="simple-table">
                <thead>
                  <tr>
                    <th>Name</th><th>Department</th><th>Batch</th>
                    <th>Company / Role</th><th>Location</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {alumni.map(a => (
                    <tr key={a.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="avatar-circle">{initials(a.name)}</div>
                          <div>
                            <div className="fw-bold" style={{ fontSize: '0.92rem' }}>{a.name}</div>
                            <div className="text-muted" style={{ fontSize: '0.78rem' }}>{a.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{a.department || '–'}</td>
                      <td>{a.graduation_year || '–'}</td>
                      <td>
                        {a.company ? (
                          <>{a.company}{a.designation && <><br/><span className="text-muted" style={{ fontSize: '0.78rem' }}>{a.designation}</span></>}</>
                        ) : '–'}
                      </td>
                      <td>{a.location || '–'}</td>
                      <td>
                        <button className="btn btn-outline-primary btn-sm me-1" onClick={() => viewProfile(a.id)}>View</button>
                        {a.id !== user.id
                          ? <button className="btn btn-outline-success btn-sm" onClick={() => msgAlumni(a.id, a.name)}>Message</button>
                          : <span className="text-muted small">(You)</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {showModal && (
        <div id="profileModal" className="modal-overlay" style={{ display: 'flex' }}
          onClick={e => e.target.id === 'profileModal' && setShowModal(false)}>
          <div className="modal-box" id="profileModalContent">
            {!profile ? (
              <p className="loader">Loading...</p>
            ) : profile.error ? (
              <p className="text-danger">{profile.error}</p>
            ) : (
              <>
                <button onClick={() => setShowModal(false)} className="btn-close"
                  style={{ position: 'absolute', top: 12, right: 12 }}/>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="avatar-circle" style={{ width: 52, height: 52, fontSize: '1.2rem' }}>{initials(profile.name)}</div>
                  <div>
                    <h5 className="mb-0 fw-bold">{profile.name}</h5>
                    <p className="text-muted small mb-0">
                      {profile.designation || ''} {profile.company ? '@ ' + profile.company : ''}
                    </p>
                  </div>
                </div>
                <table className="table table-sm table-bordered">
                  <tbody>
                    <tr><th>Email</th><td>{profile.email}</td></tr>
                    <tr><th>Department</th><td>{profile.department || '–'}</td></tr>
                    <tr><th>Batch</th><td>{profile.graduation_year || '–'}</td></tr>
                    <tr><th>Location</th><td>{profile.location || '–'}</td></tr>
                    {profile.bio && <tr><th>Bio</th><td>{profile.bio}</td></tr>}
                  </tbody>
                </table>
                <div className="d-flex gap-2 mt-2">
                  {profile.id !== user.id && (
                    <button className="btn btn-primary btn-sm"
                      onClick={() => { msgAlumni(profile.id, profile.name); setShowModal(false); }}>
                      Send Message
                    </button>
                  )}
                  {profile.linkedin && (
                    <a href={profile.linkedin} target="_blank" rel="noopener noreferrer"
                      className="btn btn-outline-secondary btn-sm">LinkedIn</a>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <HelpdeskWidget/>
    </>
  );
}
