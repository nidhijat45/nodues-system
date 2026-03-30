const bcrypt = require('bcryptjs');
const ExcelJS = require('exceljs');
const { User, Department, NoDuesRequest } = require('../models');

// Get all departments
const getDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll();
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Add teacher (admin only)
const addTeacher = async (req, res) => {
  try {
    const {
      name, email, password, mobile,
      department_id, designation, is_hod
    } = req.body;

    if (!name || !email || !password || !department_id || !designation)
      return res.status(400).json({ message: 'Fill all required feilds.' });

    const exists = await User.findOne({ where: { email } });
    if (exists)
      return res.status(409).json({ message: 'Email already registered.' });

    // Agar naya teacher HOD hai toh purana HOD hatao us department ka
    if (is_hod) {
      await User.update(
        { is_hod: false },
        { where: { department_id, is_hod: true, role: 'teacher' } }
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    const teacher = await User.create({
      name, email, password: hashed, mobile,
      role: 'teacher', department_id, designation,
      is_hod: is_hod || false
    });

    res.status(201).json({
      message: 'Teacher added successfully.',
      teacher: {
        id: teacher.id, name: teacher.name,
        email: teacher.email, designation: teacher.designation,
        is_hod: teacher.is_hod, department_id: teacher.department_id
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Get all teachers
const getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.findAll({
      where: { role: 'teacher' },
      attributes: ['id', 'name', 'email', 'mobile', 'designation', 'is_hod', 'is_active', 'department_id'],
      include: [{ model: Department, as: 'department', attributes: ['id', 'name', 'code'] }]
    });
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Update teacher
const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, mobile, designation, is_hod, department_id, is_active } = req.body;

    const teacher = await User.findOne({ where: { id, role: 'teacher' } });
    if (!teacher)
      return res.status(404).json({ message: 'Teacher not found.' });

    // Agar HOD bana rahe ho toh purana HOD hatao
    if (is_hod) {
      await User.update(
        { is_hod: false },
        { where: { department_id: department_id || teacher.department_id, is_hod: true, role: 'teacher' } }
      );
    }

    await teacher.update({ name, mobile, designation, is_hod, department_id, is_active });

    res.json({ message: 'Teacher updated successfully.', teacher });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Delete teacher (soft delete)
const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await User.findOne({ where: { id, role: 'teacher' } });
    if (!teacher)
      return res.status(404).json({ message: 'Teacher not found.' });

    await teacher.update({ is_active: false });
    res.json({ message: 'Teacher deactivated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Get all students
const getAllStudents = async (req, res) => {
  try {
    const { department_id, semester, section } = req.query;
    const where = { role: 'student' };
    if (department_id) where.department_id = department_id;
    if (semester) where.semester = semester;
    if (section) where.section = section;

    const students = await User.findAll({
      where,
      attributes: ['id', 'name', 'email', 'mobile', 'enrollment_no', 'semester', 'section', 'year', 'department_id'],
      include: [{ model: Department, as: 'department', attributes: ['id', 'name', 'code'] }]
    });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// ===================== STUDENTS =====================
const addStudent = async (req, res) => {
  try {
    const { name, email, mobile, enrollment_no, password, semester, section, year, department_id } = req.body;
    if (!name || !email || !password || !enrollment_no || !department_id) 
      return res.status(400).json({ message: 'Missing required fields.' });

    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ message: 'Email already registered.' });

    const hashed = await bcrypt.hash(password, 10);
    const student = await User.create({
      name, email, mobile, enrollment_no: enrollment_no.toUpperCase(),
      password: hashed, role: 'student', department_id, semester, section, year
    });

    res.status(201).json({ message: 'Student added successfully.', student });
  } catch (err) { res.status(500).json({ message: 'Server error.', error: err.message }); }
};

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, mobile, enrollment_no, semester, section, year, department_id, is_active } = req.body;
    const student = await User.findOne({ where: { id, role: 'student' } });
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    await student.update({ name, email, mobile, enrollment_no: enrollment_no?.toUpperCase(), semester, section, year, department_id, is_active });
    res.json({ message: 'Student updated successfully.', student });
  } catch (err) { res.status(500).json({ message: 'Server error.', error: err.message }); }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await User.findOne({ where: { id, role: 'student' } });
    if (!student) return res.status(404).json({ message: 'Student not found.' });
    await student.update({ is_active: false });
    res.json({ message: 'Student deactivated safely.' });
  } catch (err) { res.status(500).json({ message: 'Server error.', error: err.message }); }
};

// ===================== STAFF (ACCOUNT / EXAM) =====================
const addStaff = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!['account', 'exam'].includes(role)) return res.status(400).json({ message: 'Invalid role.' });
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ message: 'Email exists.' });
    
    const hashed = await bcrypt.hash(password, 10);
    const staff = await User.create({ name, email, password: hashed, role });
    res.status(201).json({ message: 'Staff added.', staff });
  } catch (err) { res.status(500).json({ message: 'Server error.', error: err.message }); }
};

const getAllStaff = async (req, res) => {
  try {
    const staff = await User.findAll({ where: { role: ['account', 'exam'] }, attributes: { exclude: ['password'] } });
    res.json(staff);
  } catch (err) { res.status(500).json({ message: 'Server error.', error: err.message }); }
};

const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, is_active } = req.body;
    const staff = await User.findOne({ where: { id, role: ['account', 'exam'] } });
    if (!staff) return res.status(404).json({ message: 'Staff not found.' });
    await staff.update({ name, email, role, is_active });
    res.json({ message: 'Staff updated.', staff });
  } catch (err) { res.status(500).json({ message: 'Server error.', error: err.message }); }
};

const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await User.findOne({ where: { id, role: ['account', 'exam'] } });
    await staff.update({ is_active: false });
    res.json({ message: 'Staff deactivated.' });
  } catch (err) { res.status(500).json({ message: 'Server error.', error: err.message }); }
};

// ===================== REPORTS =====================
const getOverview = async (req, res) => {
  try {
    const totalStudents = await User.count({ where: { role: 'student', is_active: true } });
    const completedStatus = await NoDuesRequest.count({ where: { status: 'approved' } });
    const pendingStatus = await NoDuesRequest.count({ where: { status: 'pending' } });
    res.json({ totalStudents, completedStatus, pendingStatus });
  } catch(err) { res.status(500).json({ error: err.message }); }
};

const downloadStudentReport = async (req, res) => {
  try {
    const students = await User.findAll({
      where: { role: 'student' },
      include: [
        { model: Department, as: 'department', attributes: ['name', 'code'] },
        { model: NoDuesRequest, as: 'no_dues_requests', attributes: ['status', 'requested_at'] }
      ]
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Students No Dues Report');

    worksheet.columns = [
      { header: 'Enrollment No', key: 'enrollment', width: 20 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Branch', key: 'branch', width: 15 },
      { header: 'Sem', key: 'sem', width: 10 },
      { header: 'No Dues Status', key: 'status', width: 20 },
      { header: 'Total Fees', key: 'total', width: 15 },
      { header: 'Paid Fees', key: 'paid', width: 15 },
    ];

    students.forEach(s => {
      const statusObj = s.no_dues_requests && s.no_dues_requests.length > 0 ? s.no_dues_requests[0] : null;
      worksheet.addRow({
        enrollment: s.enrollment_no,
        name: s.name,
        branch: s.department ? s.department.code : '-',
        sem: s.semester,
        status: statusObj ? statusObj.status : 'not_initiated',
        total: s.total_fees || 50000,
        paid: s.paid_fees || 0
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Students_NoDues_Report.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ message: 'Error generating report.', error: err.message });
  }
};

const downloadStaffReport = async (req, res) => {
  try {
    const staff = await User.findAll({ where: { role: ['teacher', 'account', 'exam'] } });
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Staff List');
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Role', key: 'role', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
    ];
    staff.forEach(s => {
      worksheet.addRow({
        name: s.name, email: s.email, role: s.role, status: s.is_active ? 'Active' : 'Inactive'
      });
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Staff_Report.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) { res.status(500).json({ message: 'Error.', error: err.message }); }
};

module.exports = {
  getDepartments, 
  addTeacher, getAllTeachers, updateTeacher, deleteTeacher, 
  getAllStudents, addStudent, updateStudent, deleteStudent,
  addStaff, getAllStaff, updateStaff, deleteStaff,
  getOverview, downloadStudentReport, downloadStaffReport
};