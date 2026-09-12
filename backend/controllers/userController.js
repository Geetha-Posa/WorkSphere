const User = require('../models/User');
const bcrypt = require('bcryptjs');

const createUser = async (req, res) => {
  try {
    const { name, email, password, role, team, expertiseTags } = req.body;

    if (role === 'admin') {
      return res.status(403).json({ message: 'Cannot create an admin user via this route' });
    }

    if (!['manager', 'employee'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      team: team || null,
      expertiseTags: expertiseTags || [],
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        team: user.team,
        expertiseTags: user.expertiseTags,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createUser, getUsers };
