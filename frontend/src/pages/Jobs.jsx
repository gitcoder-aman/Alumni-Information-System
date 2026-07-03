import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import HelpdeskWidget from '../components/HelpdeskWidget';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/Toast';

const emptyForm = { company: '', role: '', type: 'full-time', location: '', deadline: '', job_link: '', description: '' };

export default function Jobs() {
  const { user } = useAuth();
  const [jobs,      setJobs]      = useState(null);
  const [showForm,  setShowForm]  = useState(false);
  const [formTitle, setFormTitle] = useState('Post a Job');
  const [editId,    setEditId]    = useState('');
  const [form,      setForm]      = useState(emptyForm);
  const [fCompany,  setFCompany]  = useState('');
  const [fType,     setFType]     = useState('');

  useEffect(() => { loadJobs(); }, []);

  async function loadJobs(params = '') {
    setJobs(null);
    try { setJobs(await apiFetch('/jobs' + (params ? '?' + params : ''))); }
    catch { setJobs([]); }
  }

  function openForm(j = null) {
    setEditId(j ? j.id : '');
    setForm(j ? {
      company:     j.company     || '',
      role:        j.role        || '',
      type:        j.type        || 'full-time',
      location:    j.location    || '',
      deadline:    j.deadline?.split('T')[0] || '',
      job_link:    j.job_link    || '',
      description: j.description || '',
    } : emptyForm);
    setFormTitle(j ? 'Edit Job' : 'Post a Job');
    setShowForm(true);
  }

  function closeForm() { setShowForm(false); }

  async function saveJob() {
    if (!form.company || !form.role) { showToast('Company and role are required', 'error'); return; }
    const payload = { ...form, deadline: form.deadline || null, job_link: form.job_link.trim() || null };
    try {
      if (editId) {
        await apiFetch('/jobs/' + editId, { method: 'PUT', body: JSON.stringify(payload) });
        showToast('Job updated!', 'success');
      } else {
        await apiFetch('/jobs', { method: 'POST', body: JSON.stringify(payload) });
        showToast('Job posted!', 'success');
      }
      closeForm();
      loadJobs();
    } catch (err) { showToast(err.message, 'error'); }
  }

  async function deleteJob(id) {
    if (!confirm('Delete this job posting?')) return;
    try {
      await apiFetch('/jobs/' + id, { method: 'DELETE' });
      showToast('Deleted', 'success');
      loadJobs();
    } catch (err) { showToast(err.message, 'error'); }
  }

  function filterJobs() {
    const p = new URLSearchParams();
    if (fCompany) p.set('company', fCompany);
    if (fType)    p.set('type', fType);
    loadJobs(p.toString());
  }

  function resetFilter() { setFCompany(''); setFType(''); loadJobs(); }
  const setF = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const isAdmin = user.role === 'admin';
  const canPost = ['admin', 'alumni'].includes(user.role);

  return (
    <>
      <Navbar/>
      <div className="page-wrapper">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div>
            <h2 className="page-title mb-0">Jobs &amp; Internships</h2>
            <p className="page-subtitle mb-0">Opportunities posted by alumni</p>
          </div>
          {canPost && (
            <button id="btnPost" className="btn btn-primary" onClick={() => openForm()}>+ Post Job</button>
          )}
        </div>

        {/* Filters */}
        <div className="simple-card mb-4">
          <div className="row g-2 align-items-end">
            <div className="col-sm-4">
              <label className="form-label">Company</label>
              <input className="form-control" placeholder="Filter by company"
                value={fCompany} onChange={e => setFCompany(e.target.value)} />
            </div>
            <div className="col-sm-3">
              <label className="form-label">Type</label>
              <select className="form-select" value={fType} onChange={e => setFType(e.target.value)}>
                <option value="">All Types</option>
                <option value="full-time">Full-time</option>
                <option value="internship">Internship</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
              </select>
            </div>
            <div className="col-sm-3 d-flex gap-2">
              <button className="btn btn-primary" onClick={filterJobs}>Filter</button>
              <button className="btn btn-outline-secondary" onClick={resetFilter}>Clear</button>
            </div>
          </div>
        </div>

        {/* Post / Edit Form */}
        {showForm && (
          <div id="jobForm" className="simple-card mb-4">
            <h5 className="fw-bold mb-3" id="jobFormTitle">{formTitle}</h5>
            <div className="row g-2">
              <div className="col-sm-6">
                <label className="form-label">Company *</label>
                <input className="form-control" placeholder="e.g. Infosys" value={form.company} onChange={setF('company')} />
              </div>
              <div className="col-sm-6">
                <label className="form-label">Role / Position *</label>
                <input className="form-control" placeholder="e.g. Software Developer" value={form.role} onChange={setF('role')} />
              </div>
              <div className="col-sm-4">
                <label className="form-label">Type</label>
                <select className="form-select" value={form.type} onChange={setF('type')}>
                  <option value="full-time">Full-time</option>
                  <option value="internship">Internship</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
              <div className="col-sm-4">
                <label className="form-label">Location</label>
                <input className="form-control" placeholder="e.g. Bangalore / Remote" value={form.location} onChange={setF('location')} />
              </div>
              <div className="col-sm-4">
                <label className="form-label">Deadline</label>
                <input type="date" className="form-control" value={form.deadline} onChange={setF('deadline')} />
              </div>
              <div className="col-12">
                <label className="form-label">Job Portal Link</label>
                <input type="url" className="form-control" placeholder="https://company.com/careers/job-id"
                  value={form.job_link} onChange={setF('job_link')} />
              </div>
              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows="2" placeholder="Job requirements and details..."
                  value={form.description} onChange={setF('description')} />
              </div>
              <div className="col-12 d-flex gap-2">
                <button className="btn btn-success" onClick={saveJob}>Save</button>
                <button className="btn btn-secondary" onClick={closeForm}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Jobs Table */}
        <div id="jobsContainer">
          {jobs === null ? (
            <p className="loader">Loading jobs...</p>
          ) : jobs.length === 0 ? (
            <p className="empty-msg">No job postings yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="simple-table">
                <thead>
                  <tr>
                    <th>#</th><th>Company</th><th>Role</th><th>Type</th>
                    <th>Location</th><th>Deadline</th><th>Apply</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j, i) => {
                    const canEdit = j.posted_by === user.id;
                    const canDel  = isAdmin || j.posted_by === user.id;
                    return (
                      <tr key={j.id}>
                        <td>{i + 1}</td>
                        <td><strong>{j.company}</strong></td>
                        <td>{j.role}</td>
                        <td><span className="role-badge role-type" style={{ textTransform: 'capitalize' }}>{j.type}</span></td>
                        <td>{j.location || '–'}</td>
                        <td>{j.deadline ? new Date(j.deadline).toLocaleDateString('en-IN') : '–'}</td>
                        <td>
                          {j.job_link
                            ? <a href={j.job_link} target="_blank" rel="noopener noreferrer" className="btn btn-outline-success btn-sm">Apply ↗</a>
                            : <span className="text-muted">–</span>}
                        </td>
                        <td>
                          {canEdit && <button className="btn btn-outline-primary btn-sm me-1" onClick={() => openForm(j)}>Edit</button>}
                          {canDel  && <button className="btn btn-outline-danger btn-sm" onClick={() => deleteJob(j.id)}>Delete</button>}
                        </td>
                      </tr>
                    );
                  })}
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
