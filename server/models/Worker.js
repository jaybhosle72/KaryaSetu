const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema({
  _id: { type: String },
  cooperativeId: { type: String, required: true },
  cooperativeName: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  trade: { type: String, required: true },
  subTrades: [{ type: String }],
  experienceYears: { type: Number, default: 1 },
  completedJobs: { type: Number, default: 0 },
  reliabilityScore: { type: Number, default: 95.0 },
  customerRating: { type: Number, default: 4.8 },
  status: { 
    type: String, 
    enum: ['AVAILABLE', 'ON_DUTY', 'EMERGENCY_READY', 'OFF_DUTY'], 
    default: 'AVAILABLE' 
  },
  isEmergencyDuty: { type: Boolean, default: false },
  verifiedSkills: [{
    name: String,
    issuer: String,
    verifiedDate: String
  }],
  welfareDetails: {
    pmjayCardNumber: String,
    accidentalInsuranceActive: { type: Boolean, default: true },
    insuranceCoverageAmount: { type: Number, default: 500000 },
    welfareContributionBalance: { type: Number, default: 0 },
    pensionCreditTier: { type: String, default: 'Silver Tier' },
    lastHealthCheckup: String,
    scholarshipAvailedForDependents: { type: Number, default: 0 }
  },
  location: {
    lat: Number,
    lng: Number,
    area: String
  },
  currentWorkload: { type: Number, default: 0 },
  maxDailyCapacity: { type: Number, default: 5 },
  totalEarnings: { type: Number, default: 0 },
  contractorId: { type: String, default: null, index: true },
  contractorName: { type: String, default: null }
}, { timestamps: true, _id: false });

module.exports = mongoose.model('Worker', WorkerSchema);
