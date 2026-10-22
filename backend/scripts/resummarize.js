const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config(); // Fallback if CWD is backend
const mongoose = require('mongoose');
const Task = require('../models/Task');
const { summarizeTask } = require('../services/llmService');

const resummarizeTasks = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI environment variable is missing.');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for resummarization.');

    // Query every task where summaryStatus !== "done"
    const tasks = await Task.find({ summaryStatus: { $ne: 'done' } });
    console.log(`Found ${tasks.length} task(s) with summaryStatus !== 'done'.`);

    let successCount = 0;
    let failedCount = 0;

    for (const task of tasks) {
      console.log(`\nProcessing task: ${task._id} (file: ${task.filename || 'unknown'}, team: ${task.team})`);

      if (!task.extractedText || !task.extractedText.trim()) {
        console.warn(`Task ${task._id} has no extractedText. Setting summaryStatus to 'failed'.`);
        task.title = null;
        task.summary = null;
        task.project = null;
        task.taskType = null;
        task.requiredSkills = [];
        task.deliverables = [];
        task.deadline = null;
        task.priority = null;
        task.difficulty = null;
        task.summaryStatus = 'failed';
        await task.save();
        failedCount++;
        continue;
      }

      console.log(`Running summarizeTask for task ${task._id}...`);
      const summaryData = await summarizeTask(task.extractedText);

      if (summaryData) {
        task.title = summaryData.title;
        task.summary = summaryData.summary;
        task.project = summaryData.project;
        task.taskType = summaryData.taskType;
        task.requiredSkills = summaryData.requiredSkills;
        task.deliverables = summaryData.deliverables;
        task.deadline = summaryData.deadline;
        task.priority = summaryData.priority;
        task.difficulty = summaryData.difficulty;
        task.summaryStatus = 'done';
        await task.save();
        console.log(`✓ Updated task ${task._id}: "${task.title}" (summaryStatus: 'done')`);
        successCount++;
      } else {
        task.title = null;
        task.summary = null;
        task.project = null;
        task.taskType = null;
        task.requiredSkills = [];
        task.deliverables = [];
        task.deadline = null;
        task.priority = null;
        task.difficulty = null;
        task.summaryStatus = 'failed';
        await task.save();
        console.error(`✗ Failed to summarize task ${task._id}. Marked summaryStatus: 'failed'.`);
        failedCount++;
      }
    }

    console.log(`\nResummarization completed. Succeeded: ${successCount}, Failed: ${failedCount}, Total: ${tasks.length}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Fatal error during resummarization:', error);
    process.exit(1);
  }
};

resummarizeTasks();
