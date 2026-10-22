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
 * Verifies that a folder is reachable and accessible by the service account.
 * @param {string} folderId - The Google Drive Folder ID
 * @returns {Promise<object>} Folder metadata
 */
const verifyFolderAccess = async (folderId) => {
  const auth = getGoogleAuth();
  const drive = google.drive({ version: 'v3', auth });

  const response = await drive.files.get({
    fileId: folderId,
    fields: 'id, name, mimeType, trashed',
  });

  if (response.data.trashed) {
    throw new Error('Folder is in trash');
  }

  return response.data;
};

/**
 * Lists active (non-trashed) files from a team's Google Drive folder.
 * @param {string} teamName - Name of the team (e.g., 'Engineering', 'Design')
 * @returns {Promise<Array<{ id: string, name: string, mimeType: string, modifiedTime: string }>>}
 */
const listFilesInTeamFolder = async (teamName) => {
  const folderId = await getTeamFolderId(teamName);

  if (!folderId) {
    throw new Error(`No Google Drive folder configured for team '${teamName}'.`);
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

/**
 * Downloads a file from Google Drive as a Buffer.
 * @param {string} fileId - The ID of the file to download
 * @returns {Promise<Buffer>}
 */
const downloadFileBuffer = async (fileId) => {
  const auth = getGoogleAuth();
  const drive = google.drive({ version: 'v3', auth });
  
  const response = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'arraybuffer' }
  );
  
  return Buffer.from(response.data);
};

module.exports = {
  getGoogleAuth,
  verifyFolderAccess,
  listFilesInTeamFolder,
  downloadFileBuffer,
};
