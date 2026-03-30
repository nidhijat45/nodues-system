const {
  User, Department, Assignment, LabManual,
  AssignmentSubmission, LabManualSubmission,
  NoDuesRequest, TeacherApproval, AccountApproval,
  HODApproval, ExamApproval
} = require('../models');

// ─────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────

const getDashboard = async (req, res) => {
  try {
    const student_id = req.user.id;
    const student = await User.findOne({
      where: { id: student_id },
      attributes: ['id', 'name', 'email', 'mobile', 'enrollment_no', 'semester', 'section', 'year', 'department_id'],
      include: [{ model: Department, as: 'department', attributes: ['name', 'code'] }]
    });

    // Pending assignments count
    const pendingAssignments = await AssignmentSubmission.count({
      where: { student_id, is_submitted: false }
    });

    // No dues request status
    const noDuesRequest = await NoDuesRequest.findOne({ where: { student_id } });

    res.json({
      student,
      pending_assignments: pendingAssignments,
      nodues_status: noDuesRequest ? noDuesRequest.status : 'not_initiated'
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// ─────────────────────────────────────────
// ASSIGNMENTS
// ─────────────────────────────────────────

const getMyAssignments = async (req, res) => {
  try {
    const student_id = req.user.id;
    const { department_id, semester, section } = req.user;

    const assignments = await Assignment.findAll({
      where: { department_id, semester, section, is_active: true },
      include: [
        { model: User, as: 'teacher', attributes: ['id', 'name', 'designation'] }
      ],
      order: [['due_date', 'ASC']]
    });

    // Attach submission status for each assignment
    const result = await Promise.all(assignments.map(async (a) => {
      const submission = await AssignmentSubmission.findOne({
        where: { assignment_id: a.id, student_id }
      });
      return {
        id: a.id,
        assignment_name: a.assignment_name,
        subject_name: a.subject_name,
        given_date: a.given_date,
        due_date: a.due_date,
        file_path: a.file_path,
        teacher: a.teacher,
        is_submitted: submission ? submission.is_submitted : false,
        submitted_at: submission ? submission.submitted_at : null
      };
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// ─────────────────────────────────────────
// LAB MANUALS
// ─────────────────────────────────────────

const getMyLabManuals = async (req, res) => {
  try {
    const student_id = req.user.id;
    const { department_id, semester } = req.user;

    const labManuals = await LabManual.findAll({
      where: { department_id, semester, is_active: true },
      include: [
        { model: User, as: 'teacher', attributes: ['id', 'name', 'designation'] }
      ]
    });

    const result = await Promise.all(labManuals.map(async (lm) => {
      const submission = await LabManualSubmission.findOne({
        where: { lab_manual_id: lm.id, student_id }
      });
      return {
        id: lm.id,
        subject_name: lm.subject_name,
        teacher: lm.teacher,
        is_submitted: submission ? submission.is_submitted : false,
        submitted_at: submission ? submission.submitted_at : null
      };
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// ─────────────────────────────────────────
// NO DUES REQUEST
// ─────────────────────────────────────────

// Get all teachers of student's department+semester+section
// with their assignment/lab manual completion status
const getTeachersForRequest = async (req, res) => {
  try {
    const student_id = req.user.id;
    const { department_id, semester, section } = req.user;

    // Teachers who have assignments/lab manuals for this student
    const teachers = await User.findAll({
      where: { role: 'teacher', department_id, is_active: true },
      attributes: ['id', 'name', 'designation', 'is_hod']
    });

    const result = await Promise.all(teachers.map(async (teacher) => {
      // Assignments for this teacher
      const assignments = await Assignment.findAll({
        where: { teacher_id: teacher.id, department_id, semester, section, is_active: true }
      });

      const assignmentStatus = await Promise.all(assignments.map(async (a) => {
        const sub = await AssignmentSubmission.findOne({
          where: { assignment_id: a.id, student_id }
        });
        return {
          id: a.id,
          assignment_name: a.assignment_name,
          subject_name: a.subject_name,
          due_date: a.due_date,
          is_submitted: sub ? sub.is_submitted : false
        };
      }));

      // Lab manuals for this teacher
      const labManuals = await LabManual.findAll({
        where: { teacher_id: teacher.id, department_id, semester, is_active: true }
      });

      const labManualStatus = await Promise.all(labManuals.map(async (lm) => {
        const sub = await LabManualSubmission.findOne({
          where: { lab_manual_id: lm.id, student_id }
        });
        return {
          id: lm.id,
          subject_name: lm.subject_name,
          is_submitted: sub ? sub.is_submitted : false
        };
      }));

      // Check if all assignments and lab manuals are submitted
      const allAssignmentsDone = assignmentStatus.every(a => a.is_submitted);
      const allLabManualsDone = labManualStatus.every(lm => lm.is_submitted);
      const can_request = allAssignmentsDone && allLabManualsDone;

      return {
        teacher_id: teacher.id,
        name: teacher.name,
        designation: teacher.designation,
        is_hod: teacher.is_hod,
        assignments: assignmentStatus,
        lab_manuals: labManualStatus,
        can_request  // true only if all submitted
      };
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Submit No Dues Request to selected teachers
const submitNoDuesRequest = async (req, res) => {
  try {
    const student_id = req.user.id;
    const { teacher_ids } = req.body; // array of teacher ids

    if (!teacher_ids || !Array.isArray(teacher_ids) || teacher_ids.length === 0)
      return res.status(400).json({ message: 'Please select at least one teacher.' });

    // Check if request already exists
    let noDuesRequest = await NoDuesRequest.findOne({ where: { student_id } });

    if (noDuesRequest && noDuesRequest.status === 'pending_teachers') {
      return res.status(409).json({ message: 'Request already pending with teachers.' });
    }

    if (noDuesRequest && ['pending_account', 'pending_hod', 'pending_exam', 'approved'].includes(noDuesRequest.status)) {
      return res.status(409).json({ message: 'Request is already in progress or approved.' });
    }

    // Create or reset request
    if (!noDuesRequest) {
      noDuesRequest = await NoDuesRequest.create({
        student_id,
        status: 'pending_teachers'
      });
    } else {
      // Re-submitting after rejection
      await noDuesRequest.update({ status: 'pending_teachers' });
      // Delete old teacher approvals
      await TeacherApproval.destroy({ where: { nodues_request_id: noDuesRequest.id } });
    }

    // Create teacher approval rows
    const approvals = teacher_ids.map(tid => ({
      nodues_request_id: noDuesRequest.id,
      teacher_id: tid,
      status: 'pending'
    }));
    await TeacherApproval.bulkCreate(approvals, { ignoreDuplicates: true });

    res.status(201).json({
      message: 'No dues request submitted successfully.',
      request_id: noDuesRequest.id,
      status: 'pending_teachers'
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Track all requests & their status
const getMyRequests = async (req, res) => {
  try {
    const student_id = req.user.id;

    const noDuesRequest = await NoDuesRequest.findOne({
      where: { student_id },
      include: [
        {
          model: TeacherApproval,
          as: 'teacherApprovals',
          include: [{ model: User, as: 'teacher', attributes: ['id', 'name', 'designation'] }]
        },
        { model: AccountApproval, as: 'accountApproval' },
        {
          model: HODApproval, as: 'hodApproval',
          include: [{ model: User, as: 'hod', attributes: ['id', 'name'] }]
        },
        { model: ExamApproval, as: 'examApproval' }
      ]
    });

    if (!noDuesRequest)
      return res.json({ status: 'not_initiated', message: 'No request submitted yet.' });

    res.json({
      request_id: noDuesRequest.id,
      overall_status: noDuesRequest.status,
      initiated_at: noDuesRequest.initiated_at,
      teacher_approvals: noDuesRequest.teacherApprovals?.map(a => ({
        teacher: a.teacher,
        status: a.status,
        comment: a.comment,
        reviewed_at: a.reviewed_at
      })),
      account_status: noDuesRequest.accountApproval?.status || 'not_reached',
      hod_approval: noDuesRequest.hodApproval ? {
        hod: noDuesRequest.hodApproval.hod,
        status: noDuesRequest.hodApproval.status,
        comment: noDuesRequest.hodApproval.comment,
        reviewed_at: noDuesRequest.hodApproval.reviewed_at
      } : { status: 'not_reached' },
      exam_status: noDuesRequest.examApproval?.status || 'not_reached',
      certificate_ready: noDuesRequest.examApproval?.certificate_generated || false
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Re-apply after HOD rejection — goes back to HOD only
const reApplyRequest = async (req, res) => {
  try {
    const student_id = req.user.id;

    const noDuesRequest = await NoDuesRequest.findOne({ where: { student_id } });
    if (!noDuesRequest)
      return res.status(404).json({ message: 'No request found.' });

    if (noDuesRequest.status !== 'rejected')
      return res.status(400).json({ message: 'Request is not in rejected state.' });

    const hodApproval = await HODApproval.findOne({
      where: { nodues_request_id: noDuesRequest.id }
    });

    if (hodApproval && hodApproval.status === 'rejected') {
      // Reset HOD approval only — goes back to HOD
      await hodApproval.update({ status: 'pending', comment: null, reviewed_at: null });
      await noDuesRequest.update({ status: 'pending_hod' });
      return res.json({ message: 'Request re-submitted to HOD.' });
    }

    // If rejected by teacher — reset everything
    await TeacherApproval.update(
      { status: 'pending', comment: null, reviewed_at: null },
      { where: { nodues_request_id: noDuesRequest.id, status: 'rejected' } }
    );
    await noDuesRequest.update({ status: 'pending_teachers' });

    res.json({ message: 'Request re-submitted to teachers.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

module.exports = {
  getDashboard,
  getMyAssignments,
  getMyLabManuals,
  getTeachersForRequest,
  submitNoDuesRequest,
  getMyRequests,
  reApplyRequest,
};
