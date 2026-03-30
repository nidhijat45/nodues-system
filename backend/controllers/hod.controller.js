const {
  User, Department, NoDuesRequest,
  HODApproval, ExamApproval, TeacherApproval, AccountApproval
} = require('../models');

// GET - Pending requests for this HOD's department only
const getPendingRequests = async (req, res) => {
  try {
    const hod_id = req.user.id;
    const department_id = req.user.department_id;

    // Verify this teacher is actually HOD
    const hod = await User.findOne({ where: { id: hod_id, is_hod: true } });
    if (!hod) return res.status(403).json({ message: 'Access denied. You are not a HOD.' });

    const hodApprovals = await HODApproval.findAll({
      where: { hod_id, status: 'pending' },
      include: [
        {
          model: NoDuesRequest,
          where: { status: 'pending_hod' },
          include: [
            {
              model: User,
              as: 'student',
              attributes: ['id', 'name', 'enrollment_no', 'mobile', 'semester', 'section', 'department_id'],
              include: [{ model: Department, as: 'department', attributes: ['name', 'code'] }],
              where: { department_id } // Only this department's students
            },
            {
              model: TeacherApproval,
              as: 'teacherApprovals',
              include: [{ model: User, as: 'teacher', attributes: ['id', 'name', 'designation'] }]
            },
            { model: AccountApproval, as: 'accountApproval' }
          ]
        }
      ],
      order: [['id', 'ASC']]
    });

    const result = hodApprovals.map(a => ({
      approval_id: a.id,
      request_id: a.nodues_request_id,
      status: a.status,
      student: a.NoDuesRequest?.student,
      teacher_approvals: a.NoDuesRequest?.teacherApprovals?.map(t => ({
        teacher: t.teacher,
        status: t.status,
      })),
      fee_status: a.NoDuesRequest?.accountApproval?.status || 'pending'
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// PATCH - HOD approves request
const approveRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const hod_id = req.user.id;

    const hod = await User.findOne({ where: { id: hod_id, is_hod: true } });
    if (!hod) return res.status(403).json({ message: 'Access denied. You are not a HOD.' });

    const approval = await HODApproval.findOne({
      where: { nodues_request_id: requestId, hod_id }
    });
    if (!approval) return res.status(404).json({ message: 'Request not found.' });

    await approval.update({ status: 'approved', reviewed_at: new Date() });

    // Forward to exam department
    await NoDuesRequest.update({ status: 'pending_exam' }, { where: { id: requestId } });
    await ExamApproval.findOrCreate({
      where: { nodues_request_id: requestId },
      defaults: { status: 'pending' }
    });

    res.json({ message: 'Request approved. Forwarded to exam department.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// PATCH - HOD rejects request
const rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const hod_id = req.user.id;
    const { comment } = req.body;

    const hod = await User.findOne({ where: { id: hod_id, is_hod: true } });
    if (!hod) return res.status(403).json({ message: 'Access denied. You are not a HOD.' });

    const approval = await HODApproval.findOne({
      where: { nodues_request_id: requestId, hod_id }
    });
    if (!approval) return res.status(404).json({ message: 'Request not found.' });

    await approval.update({
      status: 'rejected',
      comment: comment || null,
      reviewed_at: new Date()
    });

    await NoDuesRequest.update({ status: 'rejected' }, { where: { id: requestId } });

    res.json({ message: 'Request rejected.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

module.exports = { getPendingRequests, approveRequest, rejectRequest };
