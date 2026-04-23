const PDFDocument = require('pdfkit');
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

    res.json({
      student,
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

// Get all teachers for student's department with their assignment/lab manual completion status
const getTeachersForRequest = async (req, res) => {
  try {
    const student_id = req.user.id;
    const { department_id, semester, section } = req.user;

    // Fetch all teachers of the student's department
    const teachers = await User.findAll({
      where: { role: 'teacher', department_id, is_active: true },
      attributes: ['id', 'name', 'designation', 'is_hod']
    });

    const result = await Promise.all(teachers.map(async (teacher) => {
      // Assignments for this teacher assigned to this student
      const assignments = await Assignment.findAll({
        where: { teacher_id: teacher.id, department_id, semester, section, is_active: true }
      });

      const assignmentStatus = await Promise.all(assignments.map(async (a) => {
        const sub = await AssignmentSubmission.findOne({
          where: { assignment_id: a.id, student_id }
        });
        return {
          id: a.id,
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
          is_submitted: sub ? sub.is_submitted : false
        };
      }));

      // Summary counts
      const total_assignments = assignments.length;
      const submitted_assignments = assignmentStatus.filter(a => a.is_submitted).length;
      const total_labs = labManuals.length;
      const submitted_labs = labManualStatus.filter(lm => lm.is_submitted).length;

      // Filter: Only include teachers who teach this student's section/semester
      if (total_assignments === 0 && total_labs === 0) return null;

      // Condition: All work done or No work assigned
      const can_request = (total_assignments === 0 || submitted_assignments === total_assignments) && 
                          (total_labs === 0 || submitted_labs === total_labs);

      return {
        teacher_id: teacher.id,
        name: teacher.name,
        designation: teacher.designation,
        is_hod: teacher.is_hod,
        assignment_status: total_assignments === 0 ? 'N/A' : (submitted_assignments === total_assignments ? 'Submitted' : 'Not Submitted'),
        assignment_count: `${submitted_assignments}/${total_assignments}`,
        lab_status: total_labs === 0 ? 'N/A' : (submitted_labs === total_labs ? 'Submitted' : 'Not Submitted'),
        lab_count: `${submitted_labs}/${total_labs}`,
        can_request
      };
    }));

    res.json(result.filter(Boolean));
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Submit No Dues Request to a specific teacher for a subject
const submitNoDuesRequest = async (req, res) => {
  try {
    const student_id = req.user.id;
    const { teacher_id, subject } = req.body;
    const document_url = req.file ? `/uploads/${req.file.filename}` : null;

    if (!teacher_id || !subject)
      return res.status(400).json({ message: 'Teacher and Subject are required.' });

    // Check if request already exists
    let noDuesRequest = await NoDuesRequest.findOne({ where: { student_id } });

    // Create or reset request
    if (!noDuesRequest) {
      noDuesRequest = await NoDuesRequest.create({
        student_id,
        status: 'pending_teachers'
      });
    } else {
      // If it exists and was previously approved or in later steps, 
      // we might need to reset it to pending_teachers if adding more teacher approvals
      // But for simplicity, we'll just allow adding approvals if not fully approved yet
      if (noDuesRequest.status === 'approved') {
        return res.status(403).json({ message: 'No dues process already completed.' });
      }
      
      // If adding more teachers after it moved to account/hod/exam, 
      // maybe we should move it back to 'pending_teachers'?
      // The user's request suggests a dynamic list.
      if (['pending_account', 'pending_hod', 'pending_exam'].includes(noDuesRequest.status)) {
         await noDuesRequest.update({ status: 'pending_teachers' });
      }
      
      // If it was draft or rejected, move to pending_teachers
      if (['draft', 'rejected'].includes(noDuesRequest.status)) {
        await noDuesRequest.update({ status: 'pending_teachers' });
      }
    }

    // Check if duplicate request for same teacher and subject (optional but good)
    const existingApproval = await TeacherApproval.findOne({
      where: { nodues_request_id: noDuesRequest.id, teacher_id, subject }
    });
    if (existingApproval) {
      return res.status(409).json({ message: 'Request already exists for this subject.' });
    }

    // Create teacher approval row
    await TeacherApproval.create({
      nodues_request_id: noDuesRequest.id,
      teacher_id,
      subject,
      document_url,
      status: 'pending'
    });

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
      teacher_approvals: noDuesRequest.teacherApprovals?.map(a => {
        const plain = a.get ? a.get({ plain: true }) : a;
        return {
          id: plain.id,
          approval_id: plain.id,
          teacher: plain.teacher,
          subject: plain.subject,
          document_url: plain.document_url,
          status: plain.status,
          comment: plain.comment,
          reviewed_at: plain.reviewed_at
        };
      }),
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

// Delete a pending no dues request
const deleteNoDuesRequest = async (req, res) => {
  try {
    const student_id = req.user.id;
    const approval_id_raw = req.params.approvalId;
    
    if (!approval_id_raw) {
      return res.status(400).json({ message: 'Missing Approval ID.' });
    }

    const approval_id = parseInt(approval_id_raw);

    if (isNaN(approval_id)) {
      return res.status(400).json({ 
        message: `Invalid Approval ID format: ${approval_id_raw}`, 
        received: approval_id_raw 
      });
    }

    const approval = await TeacherApproval.findOne({
      where: { id: approval_id },
      include: [{
        model: NoDuesRequest,
        where: { student_id }
      }]
    });

    if (!approval)
      return res.status(404).json({ message: 'Request not found.' });

    if (approval.status !== 'pending')
      return res.status(400).json({ message: 'Only pending requests can be deleted.' });

    await approval.destroy();

    res.json({ message: 'Request deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const downloadMyCertificate = async (req, res) => {
  try {
    const student_id = req.user.id;
    const noDuesRequest = await NoDuesRequest.findOne({
      where: { student_id, status: 'approved' },
      include: [
        {
          model: User, as: 'student',
          attributes: ['name', 'enrollment_no', 'semester', 'section', 'department_id'],
          include: [{ model: Department, as: 'department', attributes: ['name', 'code'] }]
        },
        {
          model: TeacherApproval, as: 'teacherApprovals',
          include: [{ model: User, as: 'teacher', attributes: ['name', 'designation'] }]
        },
        { model: AccountApproval, as: 'accountApproval' },
        { model: HODApproval, as: 'hodApproval', include: [{ model: User, as: 'hod', attributes: ['name'] }] }
      ]
    });

    if (!noDuesRequest) return res.status(404).json({ message: 'Approved request not found.' });

    const student = noDuesRequest.student;
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=nodues_${student.enrollment_no}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(22).font('Helvetica-Bold').text('NO DUES CERTIFICATE', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text('College Management System', { align: 'center' });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1.5);

    // Student Details
    doc.fontSize(14).font('Helvetica-Bold').text('Student Information');
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    doc.text(`Name            : ${student.name.toUpperCase()}`);
    doc.text(`Enrollment No   : ${student.enrollment_no}`);
    doc.text(`Department      : ${student.department?.name} (${student.department?.code})`);
    doc.text(`Semester/Section: Sem ${student.semester} - Section ${student.section}`);
    doc.moveDown(1.5);

    // Clearance Table
    doc.fontSize(14).font('Helvetica-Bold').text('Departmental Clearances');
    doc.moveDown(0.8);
    
    // Account Dept
    doc.fontSize(11).font('Helvetica-Bold').text('Accounts & Fee Section:', { continued: true });
    doc.font('Helvetica').text(` ${noDuesRequest.accountApproval?.status?.toUpperCase() || 'APPROVED'}`);
    doc.moveDown(0.5);

    // Teacher Approvals
    doc.fontSize(11).font('Helvetica-Bold').text('Faculty Clearances:');
    doc.moveDown(0.3);
    doc.font('Helvetica');
    noDuesRequest.teacherApprovals?.forEach((ta, index) => {
      doc.text(`${index + 1}. ${ta.teacher?.name} (${ta.subject || 'Faculty'}) - ${ta.status.toUpperCase()}`);
    });
    doc.moveDown(1);

    // HOD
    doc.fontSize(11).font('Helvetica-Bold').text('HOD Approval:', { continued: true });
    doc.font('Helvetica').text(` ${noDuesRequest.hodApproval?.status?.toUpperCase() || 'APPROVED'} BY ${noDuesRequest.hodApproval?.hod?.name || 'HOD'}`);
    doc.moveDown(2);

    // Footer
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);
    doc.fontSize(10).font('Helvetica-Oblique').text('This is a digitally generated certificate and does not require a physical signature.', { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, { align: 'center' });

    doc.end();
  } catch (err) {
    res.status(500).json({ message: 'Download failed.', error: err.message });
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
  deleteNoDuesRequest,
  downloadMyCertificate
};
