const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  driveFileId:   { type: String, required: true, unique: true },
  filename:      { type: String },
  team:          { type: String },
  extractedText: { type: String },

  // ── LLM-populated summary fields ──────────────────────────────────────────
  title:    { type: String, default: null },
  summary:  { type: String, default: null },
  project:  { type: String, default: null },

  taskType: {
    type: String,
    enum: [
      'ui-design', 'backend-dev', 'frontend-dev', 'security-patch',
      'bugfix', 'infrastructure', 'content-writing', 'qa-testing',
      'research', 'documentation', 'other',
      null,   // null must appear in the enum or Mongoose rejects it
    ],
    default: null,
  },

  requiredSkills: { type: [String], default: [] },
  deliverables:   { type: [String], default: [] },

  deadline: { type: Date, default: null },

  priority: {
    type: String,
    enum: ['low', 'medium', 'high', null],
    default: null,
  },

  difficulty: {
    type: String,
    enum: ['low', 'medium', 'high', null],
    default: null,
  },

  summaryStatus: {
    type: String,
    enum: ['done', 'failed', null],
    default: 'failed',
  },

  // ── Assignment / workflow fields ───────────────────────────────────────────
  status: {
    type: String,
    enum: ['unassigned', 'pending review', 'resolved'],
    default: 'unassigned',
  },

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
