const Teacher = require('../models/Teacher');
const AuditLog = require('../models/AuditLog');

exports.getTeachers = async (req, res) => {
  const { page = 1, limit = 20, search, department, isActive = true } = req.query;
  const query = { isActive };
  if (department) query.department = department;
  if (search) query.$or = [
    { name: { $regex: search, $options: 'i' } },
    { teacherId: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
    { phone: { $regex: search, $options: 'i' } }
  ];

  const total = await Teacher.countDocuments(query);
  const teachers = await Teacher.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ success: true, data: teachers, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
};

exports.getTeacher = async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
  res.json({ success: true, data: teacher });
};

exports.createTeacher = async (req, res) => {
  if (!req.body.subjects) delete req.body.subjects;
  if (!req.body.assignedClasses) delete req.body.assignedClasses;

  const count = await Teacher.countDocuments();
  req.body.teacherId = `TCH${String(count + 1).padStart(5, '0')}`;

  const teacher = await Teacher.create(req.body);
  await AuditLog.create({
    user: req.user._id, action: 'CREATE', module: 'Teachers',
    recordId: teacher._id, description: `Teacher ${teacher.name} created`
  });
  res.status(201).json({ success: true, data: teacher });
};

exports.updateTeacher = async (req, res) => {
  if (req.body.subjects === '') delete req.body.subjects;
  if (req.body.assignedClasses === '') delete req.body.assignedClasses;

  const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
  await AuditLog.create({
    user: req.user._id, action: 'UPDATE', module: 'Teachers',
    recordId: teacher._id, description: `Teacher ${teacher.name} updated`
  });
  res.json({ success: true, data: teacher });
};

exports.deleteTeacher = async (req, res) => {
  const teacher = await Teacher.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
  await AuditLog.create({
    user: req.user._id, action: 'DELETE', module: 'Teachers',
    recordId: teacher._id, description: `Teacher ${teacher.name} deactivated`
  });
  res.json({ success: true, message: 'Teacher removed successfully' });
};