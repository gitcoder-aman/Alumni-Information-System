const pool = require('../config/db');

// POST /api/messages  – send a message
const sendMessage = async (req, res) => {
  const { receiver_id, message } = req.body;
  if (!receiver_id || !message)
    return res.status(400).json({ message: 'receiver_id and message are required' });

  try {
    const [result] = await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?,?,?)',
      [req.user.id, receiver_id, message]
    );
    const [msgRows] = await pool.query('SELECT * FROM messages WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Message sent', data: msgRows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message', error: err.message });
  }
};

// GET /api/messages/inbox
const getInbox = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT m.*, u.name AS sender_name, u.email AS sender_email
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.receiver_id = ?
       ORDER BY m.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch inbox', error: err.message });
  }
};

// GET /api/messages/sent
const getSent = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT m.*, u.name AS receiver_name, u.email AS receiver_email
       FROM messages m
       JOIN users u ON m.receiver_id = u.id
       WHERE m.sender_id = ?
       ORDER BY m.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sent messages', error: err.message });
  }
};

// GET /api/messages/conversation/:userId
const getConversation = async (req, res) => {
  const otherId = req.params.userId;
  try {
    const [rows] = await pool.query(
      `SELECT m.*,
              s.name AS sender_name,
              r.name AS receiver_name
       FROM messages m
       JOIN users s ON m.sender_id   = s.id
       JOIN users r ON m.receiver_id = r.id
       WHERE (m.sender_id=? AND m.receiver_id=?)
          OR (m.sender_id=? AND m.receiver_id=?)
       ORDER BY m.created_at ASC`,
      [req.user.id, otherId, otherId, req.user.id]
    );
    // Mark incoming messages as read (MySQL uses 1/0 for boolean)
    await pool.query(
      'UPDATE messages SET is_read=1 WHERE receiver_id=? AND sender_id=? AND is_read=0',
      [req.user.id, otherId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch conversation', error: err.message });
  }
};

// DELETE /api/messages/:id
const deleteMessage = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM messages WHERE id=? AND sender_id=?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Message not found or unauthorised' });
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete message', error: err.message });
  }
};

module.exports = { sendMessage, getInbox, getSent, getConversation, deleteMessage };
