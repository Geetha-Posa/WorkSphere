const axios = require('axios');
const FormData = require('form-data');

const extractTextFromBuffer = async (buffer, filename) => {
  const ocrServiceUrl = process.env.OCR_SERVICE_URL || 'http://localhost:8001';
  const url = `${ocrServiceUrl}/extract`;

  const form = new FormData();
  form.append('file', buffer, { filename });

  try {
    const response = await axios.post(url, form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to extract text from document.');
    }

    return response.data.text;
  } catch (error) {
    if (error.response && error.response.data && !error.response.data.success) {
      throw new Error(error.response.data.error || 'OCR service returned an error.');
    }
    throw new Error(`OCR extraction failed: ${error.message}`);
  }
};

module.exports = {
  extractTextFromBuffer,
};
