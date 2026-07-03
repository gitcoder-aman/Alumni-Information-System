const pool = require('../config/db');

// GET /api/alumni  – list & search
const getAllAlumni = async (req, res) => {
  const { name, batch, department } = req.query;
  let query = `
    SELECT u.id, u.name, u.email,
           ap.graduation_year, ap.department, ap.company,
           ap.designation, ap.location, ap.linkedin, ap.bio
    FROM users u
    JOIN alumni_profiles ap ON u.id = ap.user_id
    WHERE u.role = 'alumni'
  `;
  const params = [];

  if (name)       { params.push(`%${name}%`);          query += ` AND u.name LIKE ?`; }
  if (batch)      { params.push(parseInt(batch));       query += ` AND ap.graduation_year = ?`; }
  if (department) { params.push(`%${department}%`);    query += ` AND ap.department LIKE ?`; }

  query += ' ORDER BY ap.graduation_year DESC, u.name ASC';

  try {
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch alumni', error: err.message });
  }
};

// GET /api/alumni/:id
const getAlumniById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email,
              ap.graduation_year, ap.department, ap.company,
              ap.designation, ap.location, ap.linkedin, ap.bio,
              ap.created_at, ap.updated_at
       FROM users u
       JOIN alumni_profiles ap ON u.id = ap.user_id
       WHERE u.id = ? AND u.role = 'alumni'`,
      [req.params.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: 'Alumni not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch alumni', error: err.message });
  }
};

// PUT /api/alumni/profile – update own profile (alumni only)
const updateProfile = async (req, res) => {
  const { graduation_year, department, company, designation, location, linkedin, bio } = req.body;
  const userId = req.user.id;

  try {
    const [exists] = await pool.query('SELECT id FROM alumni_profiles WHERE user_id = ?', [userId]);
    if (exists.length === 0)
      await pool.query('INSERT INTO alumni_profiles (user_id) VALUES (?)', [userId]);

    await pool.query(
      `UPDATE alumni_profiles
       SET graduation_year=?, department=?, company=?,
           designation=?, location=?, linkedin=?, bio=?
       WHERE user_id=?`,
      [graduation_year, department, company, designation, location, linkedin, bio, userId]
    );

    const [profileRows] = await pool.query(
      'SELECT * FROM alumni_profiles WHERE user_id = ?', [userId]
    );
    res.json({ message: 'Profile updated', profile: profileRows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

// GET /api/alumni/profile/me – own profile
const getMyProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email,
              ap.graduation_year, ap.department, ap.company,
              ap.designation, ap.location, ap.linkedin, ap.bio
       FROM users u
       LEFT JOIN alumni_profiles ap ON u.id = ap.user_id
       WHERE u.id = ?`,
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile', error: err.message });
  }
};

// GET /api/alumni/stats – public counts for dashboard
const getPublicStats = async (req, res) => {
  try {
    const [
      [alumni], [students], [events], [jobs]
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) AS count FROM users WHERE role='alumni'"),
      pool.query("SELECT COUNT(*) AS count FROM users WHERE role='student'"),
      pool.query('SELECT COUNT(*) AS count FROM events'),
      pool.query('SELECT COUNT(*) AS count FROM jobs'),
    ]);
    res.json({
      totalAlumni:   parseInt(alumni[0].count),
      totalStudents: parseInt(students[0].count),
      totalEvents:   parseInt(events[0].count),
      totalJobs:     parseInt(jobs[0].count),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats', error: err.message });
  }
};

module.exports = { getAllAlumni, getAlumniById, updateProfile, getMyProfile, getPublicStats };
