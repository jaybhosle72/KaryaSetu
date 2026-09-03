const mongoose = require('mongoose');

const DisputeSchema = new mongoose.Schema({
  _id: { type: String },
  bookingId: { type: String, required: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  workerId: { type: String },
  workerName: { type: String },
  cooperativeId: { type: String, required: true },
  cooperativeName: { type: String, required: true },
  serviceCategory: { type: String, required: true },
  issueType: { 
    type: String, 
    enum: ['QUALITY_OF_WORK', 'TIMELINESS_DELAY', 'OVERCHARGING_QUERY', 'BEHAVIOUR_MISCONDUCT', 'SAFETY_CONCERN'],
    default: 'QUALITY_OF_WORK'
  },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['OPEN', 'UNDER_MEDIATION', 'RESOLVED', 'CLOSED'], 
    default: 'UNDER_MEDIATION' 
  },
  resolution: { type: String },
  resolvedAt: { type: String },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, { timestamps: true, _id: false });

module.exports = mongoose.model('Dispute', DisputeSchema);
