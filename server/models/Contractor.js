const mongoose = require('mongoose');

const ContractorSchema = new mongoose.Schema({
  _id: { type: String },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  cooperativeId: { type: String, required: true },
  cooperativeName: { type: String, required: true },
  aadhaarNumber: { type: String },
  tradesManaged: [{ type: String }],
  communitySize: { type: Number, default: 0 },
  rating: { type: Number, default: 4.85 },
  completedContracts: { type: Number, default: 0 },
  location: {
    lat: Number,
    lng: Number,
    area: String,
    address: String
  },
  workerIds: [{ type: String }]
}, { timestamps: true, _id: false });

module.exports = mongoose.model('Contractor', ContractorSchema);
