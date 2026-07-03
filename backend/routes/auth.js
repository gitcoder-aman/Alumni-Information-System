const express = require('express');
const router  = express.Router();
const { register, login, getMe, getAdminId } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me  (protected)
router.get('/me', protect, getMe);

// GET /api/auth/admin-id  (protected – any logged-in user)
router.get('/admin-id', protect, getAdminId);

module.exports = router;
