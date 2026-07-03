const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const pool   = require('../config/db');

const generateToken = (user) =>
  jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

// POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password, role = 'student' } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: 'Name, email and password are required' });

  if (!['student', 'alumni'].includes(role))
    return res.status(400).json({ message: 'Role must be student or alumni' });

  const DOMAIN = 'uohyd.ac.in';
  if (!email.toLowerCase().endsWith('@' + DOMAIN))
    return res.status(400).json({
      message: `Registration is restricted to @${DOMAIN} email addresses.`
    });

  try {
    const [exists] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (exists.length > 0)
      return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)',
      [name, email, hashed, role]
    );

    const [userRows] = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [result.insertId]
    );
    const user  = userRows[0];
    const token = generateToken(user);

    if (role === 'alumni')
      await pool.query('INSERT INTO alumni_profiles (user_id) VALUES (?)', [user.id]);

    res.status(201).json({ message: 'Registered successfully', token, user });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0)
      return res.status(401).json({ message: 'Invalid email or password' });

    const user   = rows[0];
    const DOMAIN = 'uohyd.ac.in';
    if (user.role !== 'admin' && !user.email.toLowerCase().endsWith('@' + DOMAIN))
      return res.status(403).json({ message: `Access denied. Only @${DOMAIN} accounts are allowed.` });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: 'Invalid email or password' });

    const token = generateToken(user);
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch profile', error: err.message });
  }
};

// GET /api/auth/admin-id  – returns the first admin's id & name (for helpdesk widget)
const getAdminId = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name FROM users WHERE role='admin' ORDER BY id ASC LIMIT 1"
    );
    if (!rows.length) return res.status(404).json({ message: 'No admin found' });
    res.json({ id: rows[0].id, name: rows[0].name });
  } catch (err) {
    res.status(500).json({ message: 'Could not find admin', error: err.message });
  }
};

module.exports = { register, login, getMe, getAdminId };
