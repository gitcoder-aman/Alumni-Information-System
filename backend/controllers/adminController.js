const pool = require('../config/db');

// GET /api/admin/dashboard  – aggregated stats
const getDashboard = async (req, res) => {
  try {
    const [
      [users], [alumni], [students], [events], [jobs], [messages]
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) AS count FROM users"),
      pool.query("SELECT COUNT(*) AS count FROM users WHERE role='alumni'"),
      pool.query("SELECT COUNT(*) AS count FROM users WHERE role='student'"),
      pool.query("SELECT COUNT(*) AS count FROM events"),
      pool.query("SELECT COUNT(*) AS count FROM jobs"),
      pool.query("SELECT COUNT(*) AS count FROM messages"),
    ]);

    res.json({
      totalUsers:    parseInt(users[0].count),
      totalAlumni:   parseInt(alumni[0].count),
      totalStudents: parseInt(students[0].count),
      totalEvents:   parseInt(events[0].count),
      totalJobs:     parseInt(jobs[0].count),
      totalMessages: parseInt(messages[0].count),
    });
  } catch (err) {
    res.status(500).json({ message: 'Dashboard fetch failed', error: err.message });
  }
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};

// PUT /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
  const { role } = req.body;
  if (!['admin', 'student', 'alumni'].includes(role))
    return res.status(400).json({ message: 'Invalid role' });

  try {
    const [result] = await pool.query(
      'UPDATE users SET role=? WHERE id=?',
      [role, req.params.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'User not found' });

    // Auto-create alumni profile if promoted to alumni
    if (role === 'alumni') {
      await pool.query(
        'INSERT IGNORE INTO alumni_profiles (user_id) VALUES (?)',
        [req.params.id]
      );
    }

    const [userRows] = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id=?', [req.params.id]
    );
    res.json({ message: 'Role updated', user: userRows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update role', error: err.message });
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM users WHERE id=?', [req.params.id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
};

// GET /api/admin/helpdesk  – list all users who sent a message to any admin
const getHelpdeskSenders = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT u.id, u.name, u.email, u.role,
              MAX(m.created_at) AS last_msg_time,
              SUM(CASE WHEN m.is_read=0 AND m.receiver_id IN
                (SELECT id FROM users WHERE role='admin') THEN 1 ELSE 0 END) AS unread_count
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.receiver_id IN (SELECT id FROM users WHERE role='admin')
       GROUP BY u.id, u.name, u.email, u.role
       ORDER BY last_msg_time DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch helpdesk senders', error: err.message });
  }
};

// GET /api/admin/helpdesk/:userId  – full conversation between admin and a user
const getHelpdeskConversation = async (req, res) => {
  const otherId = req.params.userId;
  try {
    const [rows] = await pool.query(
      `SELECT m.*,
              s.name AS sender_name,
              r.name AS receiver_name
       FROM messages m
       JOIN users s ON m.sender_id   = s.id
       JOIN users r ON m.receiver_id = r.id
       WHERE (m.sender_id=? AND m.receiver_id IN (SELECT id FROM users WHERE role='admin'))
          OR (m.receiver_id=? AND m.sender_id IN (SELECT id FROM users WHERE role='admin'))
       ORDER BY m.created_at ASC`,
      [otherId, otherId]
    );
    // Mark messages sent by this user to admin as read
    await pool.query(
      `UPDATE messages SET is_read=1
       WHERE sender_id=? AND receiver_id IN (SELECT id FROM users WHERE role='admin') AND is_read=0`,
      [otherId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch helpdesk conversation', error: err.message });
  }
};

module.exports = { getDashboard, getUsers, updateUserRole, deleteUser, getHelpdeskSenders, getHelpdeskConversation };
