// User mongoose schema (optional)
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  socketId: { type: String },
  connectedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
