const mongoose = require('mongoose');

const PaymentRecordSchema = new mongoose.Schema({
  _id: { type: String },
  bookingId: { type: String, required: true },
  customerId: { type: String, default: 'cust_pune_01' },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  serviceCategory: { type: String },
  razorpayOrderId: { type: String, required: true },
  razorpayPaymentId: { type: String, required: true },
  razorpaySignature: { type: String },
  amount: { type: Number, required: true }, // in rupees
  currency: { type: String, default: 'INR' },
  status: { 
    type: String, 
    enum: ['CREATED', 'CAPTURED', 'VERIFIED', 'FAILED', 'REFUNDED'], 
    default: 'VERIFIED' 
  },
  paymentMethod: { type: String, default: 'RAZORPAY_TEST_MODE' },
  splitBreakdown: {
    workerAmount: { type: Number, required: true }, // 80%
    coopAmount: { type: Number, required: true },   // 10%
    welfareAmount: { type: Number, required: true },// 6%
    platformAmount: { type: Number, required: true }// 4%
  },
  workerId: { type: String },
  workerName: { type: String },
  cooperativeId: { type: String },
  cooperativeName: { type: String },
  invoiceNumber: { type: String, required: true },
  invoiceDate: { type: Date, default: Date.now },
  taxDetails: {
    taxableAmount: { type: Number },
    cgst: { type: Number }, // 9%
    sgst: { type: Number }, // 9%
    totalGst: { type: Number }
  }
}, { timestamps: true, _id: false });

module.exports = mongoose.model('PaymentRecord', PaymentRecordSchema);
