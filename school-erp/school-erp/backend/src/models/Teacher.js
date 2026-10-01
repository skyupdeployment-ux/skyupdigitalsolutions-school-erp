const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  teacherId: { type: String, unique: true },
  name: { type: String, required: true, trim: true },
  photo: { type: String },
  gender: { type: String, enum: ['Male','Female','Other'] },
  dateOfBirth: { type: Date },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: { type: String },
  qualification: { type: String },
  experience: { type: Number },
  joiningDate: { type: Date },
  department: { type: String },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
  assignedClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
  salary: { type: Number },
  bankDetails: {
    accountNumber: String,
    bankName: String,
    ifscCode: String
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

teacherSchema.index({ name: 'text', teacherId: 'text', email: 'text' });

module.exports = mongoose.model('Teacher', teacherSchema);
