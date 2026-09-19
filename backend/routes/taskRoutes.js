const express = require('express');
const router = express.Router();
const { getMyTasks } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.get('/mine', protect, getMyTasks);

module.exports = router;
