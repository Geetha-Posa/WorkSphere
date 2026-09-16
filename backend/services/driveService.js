const { google } = require('googleapis');
const { getTeamFolderId } = require('../config/driveConfig');

/**
 * Helper to initialize and authenticate Google Auth client using GOOGLE_SERVICE_ACCOUNT_JSON env string.
 */
const getGoogleAuth = () => {
  const jsonString = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!jsonString || jsonString.trim() === '') {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON environment variable is missing or empty.');
  }

  let credentials;
  try {
    credentials = JSON.parse(jsonString);
  } catch (parseError) {
    throw new Error(`Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON: ${parseError.message}`);
  }

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
};

/**
 * Lists active (non-trashed) files from a team's Google Drive folder.
 * @param {string} teamName - Name of the team (e.g., 'Engineering', 'Design')
 * @returns {Promise<Array<{ id: string, name: string, mimeType: string, modifiedTime: string }>>}
 */
const listFilesInTeamFolder = async (teamName) => {
  const folderId = getTeamFolderId(teamName);

  if (!folderId) {
    throw new Error(`No Google Drive folder configured for team '${teamName}'. Please check your environment variables.`);
  }

  const auth = getGoogleAuth();
  const drive = google.drive({ version: 'v3', auth });

  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType, modifiedTime)',
    pageSize: 100,
    orderBy: 'modifiedTime desc',
  });

  const files = response.data.files || [];
  return files.map((file) => ({
    id: file.id,
    name: file.name,
    mimeType: file.mimeType,
    modifiedTime: file.modifiedTime,
  }));
};

module.exports = {
  listFilesInTeamFolder,
};
