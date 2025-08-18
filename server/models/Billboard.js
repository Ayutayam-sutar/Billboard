const mongoose = require('mongoose');

const billboardSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  violations: [String],
  timestamp: { type: Date, default: Date.now },

  // This is the most important line.
  // It links this billboard to a specific employee.
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee', // This MUST match the name in your Employee.js model
    required: true
  },
  // You can add a status field later if you want
  // status: { type: String, default: 'Pending' } 
});

const BillboardModel = mongoose.model('Billboard', billboardSchema);

module.exports = BillboardModel;