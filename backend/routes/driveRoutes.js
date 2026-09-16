const express = require('express');
const router = express.Router();
const { syncTeamDriveFiles } = require('../controllers/driveController');
const { protect, authorize } = require('../middleware/authMiddleware');

// POST /api/drive/sync/:team - Protected route for manager and admin roles
router.post('/sync/:team', protect, authorize('manager', 'admin'), syncTeamDriveFiles);

module.exports = router;
