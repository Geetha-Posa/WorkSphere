const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    driveFolderId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collation: { locale: 'en', strength: 2 },
  }
);

teamSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

module.exports = mongoose.model('Team', teamSchema);
