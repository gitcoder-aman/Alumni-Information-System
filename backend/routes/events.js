const express = require('express');
const router  = express.Router();
const { getEvents, getEventById, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { protect, authorise } = require('../middleware/auth');

// GET  /api/events      – public
router.get('/',    getEvents);
router.get('/:id', getEventById);

// POST / PUT / DELETE – admin only
router.post('/',    protect, authorise('admin'), createEvent);
router.put('/:id',  protect, authorise('admin'), updateEvent);
router.delete('/:id', protect, authorise('admin'), deleteEvent);

module.exports = router;
