const mongoose = require('mongoose');

const billboardSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  
  // These fields are now included to store the full Gemini report
  is_compliant: { type: Boolean, default: true },
  summary: { type: String, default: "No summary provided." },
  location_details: { type: String, default: "No location detected." },

  // This is the main fix: violations is now an array of detailed objects
  violations: [{
    violation_type: String,
    severity: String,
    details: String
  }],
  
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee', 
    required: true
  },

}, { timestamps: true });

const BillboardModel = mongoose.model('Billboard', billboardSchema);

module.exports = BillboardModel;