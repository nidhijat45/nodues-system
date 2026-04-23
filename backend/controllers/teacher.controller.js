const { Op } = require('sequelize');
const ExcelJS = require('exceljs');
const {
  User, Department, Assignment, LabManual,
  AssignmentSubmission, LabManualSubmission,
  NoDuesRequest, TeacherApproval
} = require('../models');

// ─────────────────────────────────────────
// ASSIGNMENTS
// ─────────────────────────────────────────

// Add Assignment
const addAssignment = async (req, res) => {
  try {
    const teacher_id = req.user.id;
    const department_id = req.user.department_id;
    const { subject_name, assignment_name, given_date, due_date, semester, section } = req.body;
    const file_path = req.file ? req.file.filename : null;

    if (!subject_name || !assignment_name || !given_date || !due_date || !semester || !section)
      return res.status(400).json({ message: 'Sab required fields bharo.' });

    const assignment = await Assignment.create({
      teacher_id, department_id, subject_name,
      assignment_name, given_date, due_date,
      semester, section, file_path
    });

    // Us department+sem+section ke sabhi students ke liye submission rows banao
    const students = await User.findAll({
      where: { role: 'student', department_id, semester, section, is_active: true }
    });

    if (students.length > 0) {
      const submissions = students.map(s => ({
        assignment_id: assignment.id,
        student_id: s.id,
        is_submitted: false
      }));
      await AssignmentSubmission.bulkCreate(submissions, { ignoreDuplicates: true });
    }

    res.status(201).json({ message: 'Assignment added successfully.', assignment });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Get Assignments (teacher ke apne)
const getAssignments = async (req, res) => {
  try {
    const teacher_id = req.user.id;
    const now = new Date();

    const assignments = await Assignment.findAll({
      where: { teacher_id, is_active: true },
      order: [['due_date', 'DESC']]
    });

    const active = assignments.filter(a => new Date(a.due_date) >= now);
    const expired = assignments.filter(a => new Date(a.due_date) < now);

    res.json({ active, expired });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Update Assignment
const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher_id = req.user.id;
    const { subject_name, assignment_name, given_date, due_date, semester, section } = req.body;
    const file_path = req.file ? req.file.filename : undefined;

    const assignment = await Assignment.findOne({ where: { id, teacher_id } });
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });

    const updateData = { subject_name, assignment_name, given_date, due_date, semester, section };
    if (file_path) updateData.file_path = file_path;

    await assignment.update(updateData);
    res.json({ message: 'Assignment updated successfully.', assignment });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Delete Assignment (soft delete)
const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher_id = req.user.id;

    const assignment = await Assignment.findOne({ where: { id, teacher_id } });
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });

    await assignment.update({ is_active: false });
    res.json({ message: 'Assignment deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// ─────────────────────────────────────────
// LAB MANUALS
// ─────────────────────────────────────────

// Add Lab Manual
const addLabManual = async (req, res) => {
  try {
    const teacher_id = req.user.id;
    const department_id = req.user.department_id;
    const { subject_name, semester, section } = req.body;

    if (!subject_name || !semester || !section)
      return res.status(400).json({ message: 'Subject name, semester aur section required hai.' });

    const labManual = await LabManual.create({ teacher_id, department_id, subject_name, semester, section });

    // Us department+sem+section ke sabhi students ke liye submission rows banao
    const students = await User.findAll({
      where: { role: 'student', department_id, semester, section, is_active: true }
    });

    if (students.length > 0) {
      const submissions = students.map(s => ({
        lab_manual_id: labManual.id,
        student_id: s.id,
        is_submitted: false
      }));
      await LabManualSubmission.bulkCreate(submissions, { ignoreDuplicates: true });
    }

    res.status(201).json({ message: 'Lab manual added successfully.', labManual });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Get Lab Manuals
const getLabManuals = async (req, res) => {
  try {
    const teacher_id = req.user.id;
    const labManuals = await LabManual.findAll({
      where: { teacher_id, is_active: true },
      order: [['created_at', 'DESC']]
    });
    res.json(labManuals);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Update Lab Manual
const updateLabManual = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher_id = req.user.id;
    const { subject_name, semester, section } = req.body;

    const labManual = await LabManual.findOne({ where: { id, teacher_id } });
    if (!labManual) return res.status(404).json({ message: 'Lab manual not found.' });

    await labManual.update({ subject_name, semester, section });
    res.json({ message: 'Lab manual updated successfully.', labManual });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Delete Lab Manual
const deleteLabManual = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher_id = req.user.id;

    const labManual = await LabManual.findOne({ where: { id, teacher_id } });
    if (!labManual) return res.status(404).json({ message: 'Lab manual not found.' });

    await labManual.update({ is_active: false });
    res.json({ message: 'Lab manual deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// ─────────────────────────────────────────
// STUDENT LIST & SUBMISSION TRACKING
// ─────────────────────────────────────────

// Get student list with assignment/lab manual status
const getStudentList = async (req, res) => {
  try {
    const teacher_id = req.user.id;
    const department_id = req.user.department_id;
    const { semester, section, type, item_id } = req.query;

    if (!semester || !type || !item_id)
      return res.status(400).json({ message: 'semester, type, aur item_id required hai.' });

    const where = { role: 'student', department_id, semester, is_active: true };
    if (section) where.section = section;

    const students = await User.findAll({
      where,
      attributes: ['id', 'name', 'enrollment_no', 'section']
    });

    // Har student ke liye submission status attach karo
    let submissionMap = {};
    if (type === 'assignment') {
      const submissions = await AssignmentSubmission.findAll({
        where: { assignment_id: item_id }
      });
      submissions.forEach(s => { submissionMap[s.student_id] = s.is_submitted; });
    } else if (type === 'lab_manual') {
      const submissions = await LabManualSubmission.findAll({
        where: { lab_manual_id: item_id }
      });
      submissions.forEach(s => { submissionMap[s.student_id] = s.is_submitted; });
    }

    const result = students.map(s => ({
      id: s.id,
      name: s.name,
      enrollment_no: s.enrollment_no,
      section: s.section,
      is_submitted: submissionMap[s.id] || false
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Mark Assignment as Submitted
const markAssignmentSubmitted = async (req, res) => {
  try {
    const { assignmentId, studentId } = req.params;
    const { is_submitted } = req.body;

    const [submission, created] = await AssignmentSubmission.findOrCreate({
      where: { assignment_id: assignmentId, student_id: studentId },
      defaults: { is_submitted: false }
    });

    await submission.update({
      is_submitted,
      submitted_at: is_submitted ? new Date() : null
    });

    res.json({ message: `Marked as ${is_submitted ? 'submitted' : 'not submitted'}.`, submission });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Mark Lab Manual as Submitted
const markLabManualSubmitted = async (req, res) => {
  try {
    const { labManualId, studentId } = req.params;
    const { is_submitted } = req.body;

    const [submission] = await LabManualSubmission.findOrCreate({
      where: { lab_manual_id: labManualId, student_id: studentId },
      defaults: { is_submitted: false }
    });

    await submission.update({
      is_submitted,
      submitted_at: is_submitted ? new Date() : null
    });

    res.json({ message: `Marked as ${is_submitted ? 'submitted' : 'not submitted'}.`, submission });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// ─────────────────────────────────────────
// EXCEL EXPORT
// ─────────────────────────────────────────

const exportAssignmentReport = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const teacher_id = req.user.id;

    const assignment = await Assignment.findOne({ where: { id: assignmentId, teacher_id } });
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });

    const submissions = await AssignmentSubmission.findAll({
      where: { assignment_id: assignmentId },
      include: [{ model: User, as: 'student', attributes: ['name', 'enrollment_no', 'section'] }]
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Assignment Report');

    sheet.columns = [
      { header: 'Enrollment No', key: 'enrollment_no', width: 20 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Section', key: 'section', width: 10 },
      { header: 'Assignment', key: 'assignment_name', width: 30 },
      { header: 'Subject', key: 'subject_name', width: 25 },
      { header: 'Due Date', key: 'due_date', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
    ];

    // Header row styling
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern', pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    submissions.forEach(sub => {
      sheet.addRow({
        enrollment_no: sub.student?.enrollment_no || '-',
        name: sub.student?.name || '-',
        section: sub.student?.section || '-',
        assignment_name: assignment.assignment_name,
        subject_name: assignment.subject_name,
        due_date: assignment.due_date,
        status: sub.is_submitted ? 'Submitted' : 'Not Submitted'
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=assignment_${assignmentId}_report.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const exportLabManualReport = async (req, res) => {
  try {
    const { labManualId } = req.params;
    const teacher_id = req.user.id;

    const labManual = await LabManual.findOne({ where: { id: labManualId, teacher_id } });
    if (!labManual) return res.status(404).json({ message: 'Lab manual not found.' });

    const submissions = await LabManualSubmission.findAll({
      where: { lab_manual_id: labManualId },
      include: [{ model: User, as: 'student', attributes: ['name', 'enrollment_no', 'section'] }]
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Lab Manual Report');

    sheet.columns = [
      { header: 'Enrollment No', key: 'enrollment_no', width: 20 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Section', key: 'section', width: 10 },
      { header: 'Subject', key: 'subject_name', width: 25 },
      { header: 'Status', key: 'status', width: 15 },
    ];

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern', pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    submissions.forEach(sub => {
      sheet.addRow({
        enrollment_no: sub.student?.enrollment_no || '-',
        name: sub.student?.name || '-',
        section: sub.student?.section || '-',
        subject_name: labManual.subject_name,
        status: sub.is_submitted ? 'Submitted' : 'Not Submitted'
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=lab_manual_${labManualId}_report.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// ─────────────────────────────────────────
// NO DUES REQUESTS
// ─────────────────────────────────────────

// Get all pending requests for this teacher
const getRequests = async (req, res) => {
  try {
    const teacher_id = req.user.id;

    const approvals = await TeacherApproval.findAll({
      where: { teacher_id },
      include: [
        {
          model: NoDuesRequest,
          include: [
            {
              model: User,
              as: 'student',
              attributes: ['id', 'name', 'enrollment_no', 'department_id', 'semester', 'section'],
              include: [{ model: Department, as: 'department', attributes: ['name', 'code'] }]
            }
          ]
        }
      ],
      order: [['id', 'DESC']]
    });

    // Har request ke saath student ke assignments ka status bhi bhejo
    const result = await Promise.all(approvals.map(async (approval) => {
      const student = approval.NoDuesRequest?.student;
      if (!student) return approval;

      const assignments = await Assignment.findAll({
        where: { teacher_id, department_id: student.department_id, semester: student.semester, section: student.section, is_active: true }
      });

      const assignmentStatus = await Promise.all(assignments.map(async (a) => {
        const sub = await AssignmentSubmission.findOne({
          where: { assignment_id: a.id, student_id: student.id }
        });
        return {
          assignment_name: a.assignment_name,
          subject_name: a.subject_name,
          due_date: a.due_date,
          is_submitted: sub ? sub.is_submitted : false
        };
      }));

      const labManuals = await LabManual.findAll({
        where: { teacher_id, department_id: student.department_id, semester: student.semester, section: student.section, is_active: true }
      });

      const labManualStatus = await Promise.all(labManuals.map(async (lm) => {
        const sub = await LabManualSubmission.findOne({
          where: { lab_manual_id: lm.id, student_id: student.id }
        });
        return {
          subject_name: lm.subject_name,
          is_submitted: sub ? sub.is_submitted : false
        };
      }));

      return {
        approval_id: approval.id,
        status: approval.status,
        comment: approval.comment,
        reviewed_at: approval.reviewed_at,
        student: {
          id: student.id,
          name: student.name,
          enrollment_no: student.enrollment_no,
          department: student.department,
          semester: student.semester,
          section: student.section
        },
        assignments: assignmentStatus,
        lab_manuals: labManualStatus
      };
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Approve Request
const approveRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const teacher_id = req.user.id;

    const approval = await TeacherApproval.findOne({
      where: { id: requestId, teacher_id }
    });
    if (!approval) return res.status(404).json({ message: 'Request not found.' });

    const parent_request_id = approval.nodues_request_id;
    await approval.update({ status: 'approved', reviewed_at: new Date() });

    // --- FIX: Check if ALL required teachers have approved ---
    const { AccountApproval, NoDuesRequest, Assignment, LabManual } = require('../models');
    
    const noduesRequest = await NoDuesRequest.findOne({
      where: { id: parent_request_id },
      include: [{ model: User, as: 'student', attributes: ['id', 'department_id', 'semester', 'section'] }]
    });

    const student = noduesRequest.student;
    
    // Find all teachers that SHOULD approve this student
    const [tAssignments, tLabs] = await Promise.all([
      Assignment.findAll({
        where: { department_id: student.department_id, semester: student.semester, section: student.section, is_active: true },
        attributes: ['teacher_id'],
        group: ['teacher_id']
      }),
      LabManual.findAll({
        where: { department_id: student.department_id, semester: student.semester, section: student.section, is_active: true },
        attributes: ['teacher_id'],
        group: ['teacher_id']
      })
    ]);

    const requiredTeacherIds = new Set([
      ...tAssignments.map(a => a.teacher_id),
      ...tLabs.map(l => l.teacher_id)
    ]);

    // Find current approvals
    const currentApprovals = await TeacherApproval.findAll({
      where: { nodues_request_id: parent_request_id, status: 'approved' }
    });
    
    const approvedTeacherIds = new Set(currentApprovals.map(a => a.teacher_id));

    // Check if all required teachers are in the approved list
    const allApproved = Array.from(requiredTeacherIds).every(id => approvedTeacherIds.has(id));

    if (requiredTeacherIds.size > 0 && allApproved) {
      // Request ko account department ke liye forward karo
      await NoDuesRequest.update(
        { status: 'pending_account' },
        { where: { id: parent_request_id } }
      );
      await AccountApproval.findOrCreate({
        where: { nodues_request_id: parent_request_id },
        defaults: { status: 'pending' }
      });
    }

    res.json({ message: 'Request approved successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Reject Request
const rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const teacher_id = req.user.id;
    const { comment } = req.body;

    const approval = await TeacherApproval.findOne({
      where: { id: requestId, teacher_id }
    });
    if (!approval) return res.status(404).json({ message: 'Request not found.' });

    const parent_request_id = approval.nodues_request_id;
    await approval.update({
      status: 'rejected',
      comment: comment || null,
      reviewed_at: new Date()
    });

    // Overall request rejected mark karo
    await NoDuesRequest.update(
      { status: 'rejected' },
      { where: { id: parent_request_id } }
    );

    res.json({ message: 'Request rejected.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

module.exports = {
  addAssignment, getAssignments, updateAssignment, deleteAssignment,
  addLabManual, getLabManuals, updateLabManual, deleteLabManual,
  getStudentList, markAssignmentSubmitted, markLabManualSubmitted,
  exportAssignmentReport, exportLabManualReport,
  getRequests, approveRequest, rejectRequest,
};
