const express = require('express');
const { createUser, getUsers } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('admin'), createUser);
router.get('/', protect, authorize('admin'), getUsers);

module.exports = router;
