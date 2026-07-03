const express = require('express');
const router  = express.Router();
const { getAllAlumni, getAlumniById, updateProfile, getMyProfile, getPublicStats } = require('../controllers/alumniController');
const { protect, authorise } = require('../middleware/auth');

// GET /api/alumni           – list & search
router.get('/', getAllAlumni);

// GET /api/alumni/stats      – counts for dashboard (any authenticated user)
router.get('/stats', protect, getPublicStats);

// GET /api/alumni/profile/me – own profile (authenticated)
router.get('/profile/me', protect, getMyProfile);

// PUT /api/alumni/profile    – update own profile (alumni only)
router.put('/profile', protect, authorise('alumni'), updateProfile);

// GET /api/alumni/:id        – public: view a single alumni
router.get('/:id', getAlumniById);

module.exports = router;
