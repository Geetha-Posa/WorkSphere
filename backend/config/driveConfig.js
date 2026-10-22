const Team = require('../models/Team');

/**
 * Google Drive Team Folder Configuration
 * Reads team's Google Drive Folder ID from MongoDB (case-insensitive name match).
 */
const getTeamFolderId = async (teamName) => {
  if (!teamName || typeof teamName !== 'string') {
    return null;
  }

  const trimmed = teamName.trim();
  if (!trimmed) {
    return null;
  }

  const team = await Team.findOne({
    name: { $regex: new RegExp(`^${trimmed}$`, 'i') },
  });

  if (!team || !team.driveFolderId || !team.driveFolderId.trim()) {
    return null;
  }

  return team.driveFolderId.trim();
};

module.exports = {
  getTeamFolderId,
};
