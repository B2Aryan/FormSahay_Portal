const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  age: { type: Number },
  state: { type: String },
  category: { type: String }, // General, OBC, SC, ST, EWS, PwD
  income: { type: Number },
  education: { type: String },
  gender: { type: String },
  disability: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
