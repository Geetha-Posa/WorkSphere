const Task = require('../models/Task');

const getMyTasks = async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'manager') {
      tasks = await Task.find({ team: req.user.team }).select('-extractedText');
    } else if (req.user.role === 'employee') {
      tasks = await Task.find({ assignedTo: req.user.id }).select('-extractedText');
    } else {
      tasks = [];
    }
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
};

module.exports = { getMyTasks };
