const express = require('express');
const router  = express.Router();
const { getDashboard, getUsers, updateUserRole, deleteUser, getHelpdeskSenders, getHelpdeskConversation } = require('../controllers/adminController');
const { protect, authorise } = require('../middleware/auth');

// All admin routes – admin only
router.use(protect, authorise('admin'));

router.get('/dashboard',          getDashboard);
router.get('/users',              getUsers);
router.put('/users/:id/role',     updateUserRole);
router.delete('/users/:id',       deleteUser);
router.get('/helpdesk',           getHelpdeskSenders);
router.get('/helpdesk/:userId',   getHelpdeskConversation);

module.exports = router;
