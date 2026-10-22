const express = require('express');
const { getTeams, createTeam } = require('../controllers/teamController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getTeams);
router.post('/', protect, authorize('admin'), createTeam);

module.exports = router;
