const pool = require('../config/db');

// GET /api/jobs
const getJobs = async (req, res) => {
  const { type, company } = req.query;
  let query = `
    SELECT j.*, u.name AS posted_by_name
    FROM jobs j
    LEFT JOIN users u ON j.posted_by = u.id
    WHERE 1=1
  `;
  const params = [];

  if (type)    { params.push(type);             query += ` AND j.type = ?`; }
  if (company) { params.push(`%${company}%`);   query += ` AND j.company LIKE ?`; }

  query += ' ORDER BY j.created_at DESC';

  try {
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch jobs', error: err.message });
  }
};

// GET /api/jobs/:id
const getJobById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT j.*, u.name AS posted_by_name
       FROM jobs j LEFT JOIN users u ON j.posted_by = u.id
       WHERE j.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: 'Job not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch job', error: err.message });
  }
};

// POST /api/jobs  (admin / alumni)
const createJob = async (req, res) => {
  const { company, role, description, type, location, deadline, job_link } = req.body;
  if (!company || !role)
    return res.status(400).json({ message: 'Company and role are required' });

  try {
    const [result] = await pool.query(
      `INSERT INTO jobs (company, role, description, type, location, deadline, job_link, posted_by)
       VALUES (?,?,?,?,?,?,?,?)`,
      [company, role, description, type || 'full-time', location, deadline || null, job_link || null, req.user.id]
    );
    const [jobRows] = await pool.query('SELECT * FROM jobs WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Job posted', job: jobRows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to post job', error: err.message });
  }
};

// PUT /api/jobs/:id  (poster only)
const updateJob = async (req, res) => {
  const { company, role, description, type, location, deadline, job_link } = req.body;
  try {
    const [existing] = await pool.query('SELECT posted_by FROM jobs WHERE id=?', [req.params.id]);
    if (existing.length === 0)
      return res.status(404).json({ message: 'Job not found' });
    if (existing[0].posted_by !== req.user.id)
      return res.status(403).json({ message: 'Forbidden: You can only edit jobs you posted' });

    await pool.query(
      `UPDATE jobs SET company=?, role=?, description=?, type=?,
                       location=?, deadline=?, job_link=?
       WHERE id=?`,
      [company, role, description, type, location, deadline || null, job_link || null, req.params.id]
    );
    const [jobRows] = await pool.query('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    res.json({ message: 'Job updated', job: jobRows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update job', error: err.message });
  }
};

// DELETE /api/jobs/:id  (admin OR original poster)
const deleteJob = async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT posted_by FROM jobs WHERE id=?', [req.params.id]);
    if (existing.length === 0)
      return res.status(404).json({ message: 'Job not found' });

    const isAdmin  = req.user.role === 'admin';
    const isPoster = existing[0].posted_by === req.user.id;

    if (!isAdmin && !isPoster)
      return res.status(403).json({ message: 'Forbidden: You can only delete jobs you posted' });

    await pool.query('DELETE FROM jobs WHERE id=?', [req.params.id]);
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete job', error: err.message });
  }
};

module.exports = { getJobs, getJobById, createJob, updateJob, deleteJob };
