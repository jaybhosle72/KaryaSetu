const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  _id: { type: String },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  serviceCategory: { type: String, required: true },
  subTrade: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['HOUSEHOLD', 'INSTITUTIONAL', 'EMERGENCY'], 
    default: 'HOUSEHOLD' 
  },
  urgency: { 
    type: String, 
    enum: ['STANDARD', 'PRIORITY', 'EMERGENCY'], 
    default: 'STANDARD' 
  },
  bookingMode: {
    type: String,
    enum: ['SOLO_WORKER', 'CONTRACTOR_TEAM'],
    default: 'SOLO_WORKER'
  },
  teamSize: { type: Number, default: 1 },
  projectDurationDays: { type: Number, default: 1 },
  contractorId: { type: String },
  contractorName: { type: String },
  assignedWorkerIds: [{ type: String }],
  address: { type: String, required: true },
  cooperativeId: { type: String },
  cooperativeName: { type: String },
  assignedWorkerId: { type: String },
  workerName: { type: String },
  workerPhone: { type: String },
  status: { 
    type: String, 
    enum: ['MATCHING', 'ALLOCATED', 'EN_ROUTE', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'PROPOSAL_PENDING', 'PROPOSAL_RECEIVED'], 
    default: 'MATCHING' 
  },
  projectScope: { type: mongoose.Schema.Types.Mixed },
  proposal: { type: mongoose.Schema.Types.Mixed },
  totalAmount: { type: Number, required: true },
  paymentBreakdown: {
    workerAmount: { type: Number, default: 0 },
    coopAmount: { type: Number, default: 0 },
    welfareAmount: { type: Number, default: 0 },
    platformAmount: { type: Number, default: 0 }
  },
  paymentStatus: { 
    type: String, 
    enum: ['PENDING', 'PAID', 'REFUNDED'], 
    default: 'PENDING' 
  },
  paymentMethod: { type: String, default: 'UPI' },
  invoiceNumber: { type: String },
  allocationRationale: { type: String },
  etaMinutes: { type: Number, default: 20 },
  ratings: {
    score: Number,
    comment: String,
    quality: Number,
    punctuality: Number,
    safety: Number,
    cooperativeEndorsement: { type: Boolean, default: true }
  },
  emergencyTriggerReason: { type: String },
  otp: { type: String, default: '4821' },
  completedAt: { type: Date }
}, { timestamps: true, _id: false });

module.exports = mongoose.model('Booking', BookingSchema);
