const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  driveFileId: { type: String, required: true, unique: true },
  filename: { type: String },
  team: { type: String },
  extractedText: { type: String },
  title: { type: String, default: null },
  project: { type: String, default: null },
  deadline: { type: String, default: null },
  difficulty: { type: String, default: null },
  status: { type: String, enum: ['unassigned', 'pending review', 'resolved'], default: 'unassigned' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
