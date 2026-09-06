const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  _id: { type: String },
  username: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
  password: { type: String },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  role: { 
    type: String, 
    enum: ['customer', 'worker', 'contractor', 'admin', 'cooperative', 'federation'], 
    default: 'customer' 
  },
  address: { type: String, default: 'Pune, Maharashtra' },
  cooperativeId: { type: String },
  cooperativeName: { type: String },
  workerId: { type: String },
  contractorId: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true, _id: false });

UserSchema.index({ phone: 1, role: 1 });

module.exports = mongoose.model('User', UserSchema);

