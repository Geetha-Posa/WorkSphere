const express = require('express');
const {
  loginUser,
  refreshUserToken,
  logoutUser,
} = require('../controllers/authController');

const router = express.Router();

router.post('/login', loginUser);
router.post('/refresh', refreshUserToken);
router.post('/logout', logoutUser);

module.exports = router;
