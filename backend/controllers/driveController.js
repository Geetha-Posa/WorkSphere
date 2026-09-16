const { listFilesInTeamFolder } = require('../services/driveService');

const syncTeamDriveFiles = async (req, res) => {
  try {
    // Priority: parameter team or user's assigned team
    const teamName = req.params.team || (req.user && req.user.team);

    if (!teamName) {
      return res.status(400).json({ message: 'Team name is required for Drive sync.' });
    }

    const files = await listFilesInTeamFolder(teamName);

    return res.status(200).json({
      message: `Found ${files.length} documents`,
      files,
    });
  } catch (error) {
    console.error('Drive Sync Error:', error.message);

    if (error.message.includes('No Google Drive folder configured')) {
      return res.status(400).json({ message: error.message });
    }

    if (
      error.message.includes('GOOGLE_SERVICE_ACCOUNT_JSON') ||
      error.message.includes('parse')
    ) {
      return res.status(500).json({ message: `Drive authentication configuration error: ${error.message}` });
    }

    return res.status(502).json({
      message: error.message || 'Google Drive API error during file sync.',
    });
  }
};

module.exports = {
  syncTeamDriveFiles,
};
