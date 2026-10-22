const { listFilesInTeamFolder, downloadFileBuffer } = require('../services/driveService');
const { extractTextFromBuffer } = require('../services/ocrClient');
const { summarizeTask } = require('../services/llmService');
const Task = require('../models/Task');

const syncTeamDriveFiles = async (req, res) => {
  try {
    // Priority: parameter team or user's assigned team
    const teamName = req.params.team || (req.user && req.user.team);

    if (!teamName) {
      return res.status(400).json({ message: 'Team name is required for Drive sync.' });
    }

    const files = await listFilesInTeamFolder(teamName);

    // Process new files
    let newTasksCount = 0;
    let skippedCount = 0;

    for (const file of files) {
      try {
        const existingTask = await Task.findOne({ driveFileId: file.id });
        if (existingTask) {
          console.log(`Task for file ${file.name} already exists. Skipping.`);
          skippedCount++;
          continue;
        }

        console.log(`Downloading file: ${file.name} (${file.id})`);
        const buffer = await downloadFileBuffer(file.id);
        
        console.log(`Extracting text for: ${file.name}`);
        const extractedText = await extractTextFromBuffer(buffer, file.name);
        
        console.log(`\n--- Extracted Text for ${file.name} ---\n`);
        console.log(extractedText);
        console.log(`\n---------------------------------------\n`);

        console.log(`Summarizing task with Gemini for: ${file.name}`);
        const summaryData = await summarizeTask(extractedText);

        const taskData = {
          driveFileId: file.id,
          filename: file.name,
          team: teamName,
          extractedText: extractedText,
          status: 'unassigned',
          title: summaryData ? summaryData.title : null,
          summary: summaryData ? summaryData.summary : null,
          project: summaryData ? summaryData.project : null,
          taskType: summaryData ? summaryData.taskType : null,
          requiredSkills: summaryData ? summaryData.requiredSkills : [],
          deliverables: summaryData ? summaryData.deliverables : [],
          deadline: summaryData ? summaryData.deadline : null,
          priority: summaryData ? summaryData.priority : null,
          difficulty: summaryData ? summaryData.difficulty : null,
          summaryStatus: summaryData ? 'done' : 'failed',
        };

        const newTask = new Task(taskData);
        await newTask.save();
        newTasksCount++;

      } catch (err) {
        console.error(`Failed to process ${file.name}:`, err.message);
      }
    }

    return res.status(200).json({
      message: `Sync complete. ${newTasksCount} new tasks created, ${skippedCount} skipped.`,
      newTasksCount,
      skippedCount,
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
