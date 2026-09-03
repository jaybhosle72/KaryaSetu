const mongoose = require('mongoose');

const DemandForecastSchema = new mongoose.Schema({
  _id: { type: String },
  locality: { type: String, required: true },
  trade: { type: String, required: true },
  currentDemand: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'VERY HIGH'], default: 'MEDIUM' },
  expectedDemandTomorrow: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'VERY HIGH'], default: 'HIGH' },
  historicalTrendPercentage: { type: String, default: '+50%' },
  confidenceScore: { type: Number, default: 90.0 },
  causeFactor: { type: String },
  recommendedWorkforceAllocation: { type: Number, default: 10 },
  currentAvailableInZone: { type: Number, default: 5 },
  shortfall: { type: Number, default: 5 },
  actionRecommendation: { type: String }
}, { timestamps: true, _id: false });

module.exports = mongoose.model('DemandForecast', DemandForecastSchema);
