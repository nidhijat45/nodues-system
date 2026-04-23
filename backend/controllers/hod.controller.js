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

    // Mark as fully approved and set completion date
    await NoDuesRequest.update(
      { status: 'approved', completed_at: new Date() },
      { where: { id: requestId } }
    );

    // Still create ExamApproval record for record-keeping but as auto-approved
    await ExamApproval.findOrCreate({
      where: { nodues_request_id: requestId },
      defaults: { status: 'approved', reviewed_at: new Date() }
    });

    res.json({ message: 'Request approved. Process completed.' });
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

// GET - Department-wide report for HOD
const getDepartmentReport = async (req, res) => {
  try {
    const hod_id = req.user.id;
    const department_id = req.user.department_id;

    const hod = await User.findOne({ where: { id: hod_id, is_hod: true } });
    if (!hod) return res.status(403).json({ message: 'Access denied. You are not a HOD.' });

    const students = await User.findAll({
      where: { role: 'student', department_id, is_active: true },
      attributes: ['id', 'name', 'enrollment_no', 'semester', 'section'],
      include: [
        {
          model: NoDuesRequest,
          as: 'no_dues_requests',
          attributes: ['id', 'status', 'initiated_at', 'completed_at']
        }
      ],
      order: [['semester', 'ASC'], ['section', 'ASC'], ['enrollment_no', 'ASC']]
    });

    const report = students.map(s => {
      const request = s.no_dues_requests && s.no_dues_requests.length > 0 ? s.no_dues_requests[0] : null;
      return {
        id: s.id,
        name: s.name,
        enrollment_no: s.enrollment_no,
        semester: s.semester,
        section: s.section,
        status: request ? request.status : 'not_initiated',
        initiated_at: request ? request.initiated_at : null,
        completed_at: request ? request.completed_at : null
      };
    });

    // Aggregated stats
    const stats = {
      total: report.length,
      completed: report.filter(r => r.status === 'approved').length,
      in_progress: report.filter(r => r.status !== 'not_initiated' && r.status !== 'approved' && r.status !== 'rejected').length,
      not_started: report.filter(r => r.status === 'not_initiated').length,
      rejected: report.filter(r => r.status === 'rejected').length,
    };

    res.json({ stats, report });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

module.exports = { getPendingRequests, approveRequest, rejectRequest, getDepartmentReport };
