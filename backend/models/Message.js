// Message mongoose schema (optional)
const mongoose = require('mongoose');

const ReactionSchema = new mongoose.Schema({
  emoji: String,
  userIds: [String],
});

const MessageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  senderId: { type: String },
  message: { type: String },
  room: { type: String, default: null },
  isPrivate: { type: Boolean, default: false },
  to: { type: String, default: null },
  timestamp: { type: Date, default: Date.now },
  readBy: [{ type: String }],
  reactions: { type: Map, of: [String] },
});

module.exports = mongoose.models.Message || mongoose.model('Message', MessageSchema);
