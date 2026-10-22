const Team = require('../models/Team');
const { verifyFolderAccess } = require('../services/driveService');

/**
 * @desc Get all teams
 * @route GET /api/teams
 * @access Private (Any role)
 */
const getTeams = async (req, res) => {
  try {
    const isAdmin = req.user && req.user.role === 'admin';
    if (isAdmin) {
      const teams = await Team.find({}).sort({ name: 1 });
      return res.status(200).json(teams);
    } else {
      const teams = await Team.find({}).select('_id name').sort({ name: 1 });
      return res.status(200).json(teams.map((t) => ({ _id: t._id, name: t.name })));
    }
  } catch (error) {
    console.error('Error fetching teams:', error);
    return res.status(500).json({ message: 'Server error fetching teams' });
  }
};

/**
 * @desc Create a team
 * @route POST /api/teams
 * @access Private (Admin only)
 */
const createTeam = async (req, res) => {
  try {
    const { name, driveFolderId } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Team name is required' });
    }

    if (!driveFolderId || typeof driveFolderId !== 'string' || !driveFolderId.trim()) {
      return res.status(400).json({ message: 'Drive folder ID is required' });
    }

    const trimmedName = name.trim();
    const trimmedFolderId = driveFolderId.trim();

    // Check duplicate name (case-insensitive)
    const existingTeam = await Team.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
    });

    if (existingTeam) {
      return res.status(409).json({ message: 'Team name already exists' });
    }

    // Verify folder is reachable with service account (drive.files.get on folder ID, drive.readonly)
    try {
      await verifyFolderAccess(trimmedFolderId);
    } catch (driveErr) {
      return res.status(400).json({
        message: 'Folder not found or not shared with the service account',
      });
    }

    // Save team
    const team = await Team.create({
      name: trimmedName,
      driveFolderId: trimmedFolderId,
    });

    return res.status(201).json(team);
  } catch (error) {
    console.error('Error creating team:', error);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Team name already exists' });
    }
    return res.status(500).json({ message: 'Server error creating team' });
  }
};

module.exports = {
  getTeams,
  createTeam,
};
