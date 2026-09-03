const mongoose = require('mongoose');

const InstitutionalContractSchema = new mongoose.Schema({
  _id: { type: String },
  clientName: { type: String, required: true },
  clientType: { 
    type: String, 
    enum: ['Housing Society', 'Educational Institution', 'Commercial Complex', 'Healthcare / Hospital', 'Government Body'], 
    default: 'Housing Society' 
  },
  address: { type: String, required: true },
  cooperativeId: { type: String, required: true },
  cooperativeName: { type: String, required: true },
  contractTitle: { type: String, required: true },
  requestedCrew: [{
    trade: String,
    count: Number,
    role: String
  }],
  durationMonths: { type: Number, default: 12 },
  startDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  monthlyValue: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['ACTIVE', 'PENDING_ALLOCATION', 'COMPLETED', 'UNDER_REVIEW'], 
    default: 'ACTIVE' 
  },
  allocatedWorkers: [{ type: String }],
  slaCompliance: { type: String, default: '99.0%' },
  welfareContributionMonthly: { type: Number, default: 0 },
  notes: { type: String }
}, { timestamps: true, _id: false });

module.exports = mongoose.model('InstitutionalContract', InstitutionalContractSchema);
