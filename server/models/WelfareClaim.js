const mongoose = require('mongoose');

const WelfareClaimSchema = new mongoose.Schema({
  _id: { type: String },
  workerId: { type: String, required: true },
  workerName: { type: String, required: true },
  cooperativeName: { type: String, required: true },
  type: { 
    type: String, 
    default: 'PREVENTIVE_HEALTH_CAMP',
    required: true 
  },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'DISBURSED', 'REJECTED'], 
    default: 'DISBURSED' 
  },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  description: { type: String }
}, { timestamps: true, _id: false });

module.exports = mongoose.model('WelfareClaim', WelfareClaimSchema);
