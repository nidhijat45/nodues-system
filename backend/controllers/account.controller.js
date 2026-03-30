const { Op } = require('sequelize');
const {
  User, Department, NoDuesRequest,
  AccountApproval, HODApproval
} = require('../models');

// Helper to get student info with filters
const buildStudentWhere = (query) => {
  const where = {};
  if (query.department_id) where['$student.department_id$'] = query.department_id;
  if (query.semester) where['$student.semester$'] = query.semester;
  if (query.section) where['$student.section$'] = query.section;
  return where;
};

// GET - All pending requests for account department
const getPendingRequests = async (req, res) => {
  try {
    const { department_id, semester, section } = req.query;

    const accountApprovals = await AccountApproval.findAll({
      where: { status: 'pending' },
      include: [
        {
          model: NoDuesRequest,
          where: { status: 'pending_account' },
          include: [
            {
              model: User,
              as: 'student',
              attributes: ['id', 'name', 'enrollment_no', 'mobile', 'semester', 'section', 'department_id', 'total_fees', 'paid_fees'],
              include: [{ model: Department, as: 'department', attributes: ['name', 'code'] }],
              where: {
                ...(department_id && { department_id }),
                ...(semester && { semester }),
                ...(section && { section }),
              }
            }
          ]
        }
      ],
      order: [['id', 'ASC']]
    });

    const result = accountApprovals.map(a => ({
      approval_id: a.id,
      request_id: a.nodues_request_id,
      status: a.status,
      student: a.NoDuesRequest?.student
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// GET - All approved requests
const getApprovedRequests = async (req, res) => {
  try {
    const { department_id, semester, section } = req.query;

    const accountApprovals = await AccountApproval.findAll({
      where: { status: 'approved' },
      include: [
        {
          model: NoDuesRequest,
          include: [
            {
              model: User,
              as: 'student',
              attributes: ['id', 'name', 'enrollment_no', 'mobile', 'semester', 'section', 'department_id', 'total_fees', 'paid_fees'],
              include: [{ model: Department, as: 'department', attributes: ['name', 'code'] }],
              where: {
                ...(department_id && { department_id }),
                ...(semester && { semester }),
                ...(section && { section }),
              }
            }
          ]
        }
      ],
      order: [['reviewed_at', 'DESC']]
    });

    const result = accountApprovals.map(a => ({
      approval_id: a.id,
      request_id: a.nodues_request_id,
      status: a.status,
      reviewed_at: a.reviewed_at,
      student: a.NoDuesRequest?.student
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// PATCH - Approve student fee
const approveStudent = async (req, res) => {
  try {
    const { requestId } = req.params;
    const reviewed_by = req.user.id;

    const approval = await AccountApproval.findOne({
      where: { nodues_request_id: requestId }
    });
    if (!approval) return res.status(404).json({ message: 'Request not found.' });
    if (approval.status === 'approved') return res.status(400).json({ message: 'Already approved.' });

    await approval.update({ status: 'approved', reviewed_by, reviewed_at: new Date() });

    // Find HOD of student's department and forward request
    const noDuesRequest = await NoDuesRequest.findOne({ where: { id: requestId } });
    const student = await User.findOne({ where: { id: noDuesRequest.student_id } });

    if (student.total_fees > student.paid_fees) {
      return res.status(400).json({ message: `Cannot approve. Pending fee is ₹${student.total_fees - student.paid_fees}.` });
    }

    const hod = await User.findOne({
      where: { role: 'teacher', department_id: student.department_id, is_hod: true, is_active: true }
    });

    if (!hod) {
      return res.status(400).json({ message: 'No HOD found for this department. Please assign a HOD first.' });
    }

    // Update request status and create HOD approval
    await noDuesRequest.update({ status: 'pending_hod' });
    await HODApproval.findOrCreate({
      where: { nodues_request_id: requestId },
      defaults: { hod_id: hod.id, status: 'pending' }
    });

    res.json({ message: 'Student fee approved. Request forwarded to HOD.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// PATCH - Reject student fee
const rejectStudent = async (req, res) => {
  try {
    const { requestId } = req.params;
    const reviewed_by = req.user.id;

    const approval = await AccountApproval.findOne({
      where: { nodues_request_id: requestId }
    });
    if (!approval) return res.status(404).json({ message: 'Request not found.' });

    await approval.update({ status: 'rejected', reviewed_by, reviewed_at: new Date() });
    await NoDuesRequest.update({ status: 'rejected' }, { where: { id: requestId } });

    res.json({ message: 'Request rejected.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// GET - All students fees
const getStudentFees = async (req, res) => {
  try {
    const { department_id, semester, section } = req.query;
    
    const where = { role: 'student', is_active: true };
    if (department_id) where.department_id = department_id;
    if (semester) where.semester = semester;
    if (section) where.section = section;

    const students = await User.findAll({
      where,
      attributes: ['id', 'name', 'enrollment_no', 'mobile', 'semester', 'section', 'department_id', 'total_fees', 'paid_fees'],
      include: [{ model: Department, as: 'department', attributes: ['name', 'code'] }],
      order: [['semester', 'ASC'], ['enrollment_no', 'ASC']]
    });

    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// PATCH - Update student fees
const updateStudentFees = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { paid_fees } = req.body;

    const student = await User.findOne({ where: { id: studentId, role: 'student' } });
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    await student.update({ paid_fees });
    
    res.json({ message: 'Fees updated successfully.', student });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

module.exports = { getPendingRequests, getApprovedRequests, approveStudent, rejectStudent, getStudentFees, updateStudentFees };
