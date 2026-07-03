const express = require('express');
const router  = express.Router();
const { getJobs, getJobById, createJob, updateJob, deleteJob } = require('../controllers/jobController');
const { protect, authorise } = require('../middleware/auth');

// GET  /api/jobs  – public
router.get('/',    getJobs);
router.get('/:id', getJobById);

// POST – admin or alumni can post jobs
router.post('/',    protect, authorise('admin', 'alumni'), createJob);

// PUT – admin or alumni (the poster) can update
router.put('/:id',    protect, authorise('admin', 'alumni'), updateJob);

// DELETE – admin or original poster (alumni) can delete
router.delete('/:id', protect, authorise('admin', 'alumni'), deleteJob);

module.exports = router;
