const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  designation: { type: String, required: true, enum: ['कार्यकारी अभियंता', 'उपविभागीय अभियंता', 'शाखा अभियंता','कालवा निरीक्षक'] },  // Can be 'admin', 'user', or 'manager' (customize as needed)
  phoneNumber: { type: String, required: true },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare passwords for login
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
