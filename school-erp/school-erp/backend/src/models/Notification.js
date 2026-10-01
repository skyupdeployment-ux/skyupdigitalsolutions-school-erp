const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['Fee','Attendance','Exam','Library','Transport','Admission','General'], default: 'General' },
  recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isRead: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, readAt: Date }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
