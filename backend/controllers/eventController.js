const pool = require('../config/db');

// GET /api/events
const getEvents = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.*, u.name AS created_by_name
       FROM events e
       LEFT JOIN users u ON e.created_by = u.id
       ORDER BY e.event_date ASC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch events', error: err.message });
  }
};

// GET /api/events/:id
const getEventById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.*, u.name AS created_by_name
       FROM events e
       LEFT JOIN users u ON e.created_by = u.id
       WHERE e.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: 'Event not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch event', error: err.message });
  }
};

// POST /api/events  (admin only)
const createEvent = async (req, res) => {
  const { title, description, event_date, location } = req.body;
  if (!title || !event_date)
    return res.status(400).json({ message: 'Title and event_date are required' });

  try {
    const [result] = await pool.query(
      `INSERT INTO events (title, description, event_date, location, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [title, description, event_date, location, req.user.id]
    );
    const [eventRows] = await pool.query('SELECT * FROM events WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Event created', event: eventRows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create event', error: err.message });
  }
};

// PUT /api/events/:id  (admin only)
const updateEvent = async (req, res) => {
  const { title, description, event_date, location } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE events SET title=?, description=?, event_date=?, location=? WHERE id=?`,
      [title, description, event_date, location, req.params.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Event not found' });

    const [eventRows] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
    res.json({ message: 'Event updated', event: eventRows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update event', error: err.message });
  }
};

// DELETE /api/events/:id  (admin only)
const deleteEvent = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM events WHERE id=?', [req.params.id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete event', error: err.message });
  }
};

module.exports = { getEvents, getEventById, createEvent, updateEvent, deleteEvent };
