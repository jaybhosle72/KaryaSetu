const mongoose = require('mongoose');

const CooperativeSchema = new mongoose.Schema({
  _id: { type: String },
  name: { type: String, required: true },
  shortName: { type: String, required: true },
  regNumber: { type: String, required: true, unique: true },
  establishedYear: { type: Number, default: 2020 },
  district: { type: String, required: true },
  state: { type: String, default: 'Maharashtra' },
  coverageAreas: [{ type: String }],
  serviceCategories: [{ type: String }],
  totalWorkers: { type: Number, default: 0 },
  activeWorkers: { type: Number, default: 0 },
  rating: { type: Number, default: 4.8 },
  reliabilityScore: { type: Number, default: 97.0 },
  welfareFundBalance: { type: Number, default: 0 },
  totalJobsCompleted: { type: Number, default: 0 },
  emergencyResponseTimeAvg: { type: String, default: '15 mins' },
  contact: {
    president: String,
    secretary: String,
    phone: String,
    email: String
  },
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  splitConfig: {
    workerShare: { type: Number, default: 80 },
    coopShare: { type: Number, default: 10 },
    welfareShare: { type: Number, default: 6 },
    platformShare: { type: Number, default: 4 }
  }
}, { timestamps: true, _id: false });

module.exports = mongoose.model('Cooperative', CooperativeSchema);
