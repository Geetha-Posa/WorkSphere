/**
 * Google Drive Team Folder Configuration
 * Maps team names to their respective Google Drive Folder IDs stored in environment variables.
 */

const getTeamFolderId = (teamName) => {
  if (!teamName || typeof teamName !== 'string') {
    return null;
  }

  const normalized = teamName.trim().toLowerCase();

  const folderMap = {
    design: process.env.DRIVE_FOLDER_DESIGN,
    engineering: process.env.DRIVE_FOLDER_ENGINEERING,
    qa: process.env.DRIVE_FOLDER_QA,
    devops: process.env.DRIVE_FOLDER_DEVOPS,
  };

  const folderId = folderMap[normalized];
  return folderId && folderId.trim() !== '' ? folderId.trim() : null;
};

module.exports = {
  getTeamFolderId,
};
