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

    const noDuesRequest = await NoDuesRequest.findOne({ where: { student_id } });

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
        subject_name: assignments.length > 0 ? assignments[0].subject_name : (labManuals.length > 0 ? labManuals[0].subject_name : 'General'),
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

    const { department_id, semester, section } = req.user;

    // --- NEW: Check if work is done for this teacher ---
    const [assignments, labManuals] = await Promise.all([
      Assignment.findAll({
        where: { teacher_id, department_id, semester, section, is_active: true }
      }),
      LabManual.findAll({
        where: { teacher_id, department_id, semester, is_active: true }
      })
    ]);

    const aStatus = await Promise.all(assignments.map(async (a) => {
      const sub = await AssignmentSubmission.findOne({ where: { assignment_id: a.id, student_id } });
      return sub ? sub.is_submitted : false;
    }));

    const lStatus = await Promise.all(labManuals.map(async (lm) => {
      const sub = await LabManualSubmission.findOne({ where: { lab_manual_id: lm.id, student_id } });
      return sub ? sub.is_submitted : false;
    }));

    const allAssignmentsDone = aStatus.every(s => s === true);
    const allLabsDone = lStatus.every(s => s === true);

    if (!allAssignmentsDone || !allLabsDone) {
      return res.status(400).json({ 
        message: 'Aapne abhi is teacher ke saare assignments ya lab manuals submit nahi kiye hain.' 
      });
    }

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
    const QRCode = require('qrcode');

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
        { model: HODApproval, as: 'hodApproval', include: [{ model: User, as: 'hod', attributes: ['name'] }] },
        { model: ExamApproval, as: 'examApproval' }
      ]
    });

    if (!noDuesRequest) return res.status(404).json({ message: 'Approved request not found.' });

    const student = noDuesRequest.student;
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=nodues_${student.enrollment_no}.pdf`);
    doc.pipe(res);

    // --- Helper for Tables ---
    const drawTable = (doc, title, headers, rows, startY) => {
      doc.fontSize(12).font('Helvetica-Bold').text(title, 50, startY);
      let currentY = startY + 20;

      const colWidth = 500 / headers.length;

      // Draw Headers
      doc.rect(50, currentY, 500, 20).fill('#f3f4f6').stroke('#d1d5db');
      doc.fill('#374151');
      headers.forEach((h, i) => {
        const x = 50 + (i * colWidth);
        doc.text(h, x + 5, currentY + 5, { width: colWidth - 10 });
      });

      currentY += 20;

      // Draw Rows
      rows.forEach((row) => {
        // Calculate max height for this row
        let maxHeight = 20;
        row.forEach((cell, i) => {
          const textHeight = doc.heightOfString(cell || '-', { width: colWidth - 10 });
          if (textHeight + 10 > maxHeight) maxHeight = textHeight + 10;
        });

        doc.rect(50, currentY, 500, maxHeight).stroke('#d1d5db');
        row.forEach((cell, i) => {
          const x = 50 + (i * colWidth);
          doc.fontSize(10).font('Helvetica').text(cell || '-', x + 5, currentY + 5, { width: colWidth - 10 });
        });
        currentY += maxHeight;
      });

      return currentY + 15;
    };

    // Header
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#1e40af').text('NO DUES CERTIFICATE', { align: 'center' });
    doc.fontSize(10).font('Helvetica').fillColor('#6b7280').text('College Management System - Session 2025-26', { align: 'center' });
    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e5e7eb').stroke();
    doc.moveDown(1.5);

    // Student Details Section
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#111827').text('Student Information', 50);
    doc.fontSize(10).font('Helvetica').fillColor('#374151');
    const studentInfoY = doc.y + 10;
    doc.text(`Name: ${student.name.toUpperCase()}`, 50, studentInfoY);
    doc.text(`Enrollment No: ${student.enrollment_no}`, 300, studentInfoY);
    doc.text(`Department: ${student.department?.name}`, 50, studentInfoY + 15);
    doc.text(`Sem/Section: ${student.semester} / ${student.section}`, 300, studentInfoY + 15);
    
    let nextY = studentInfoY + 45;

    // 1. Faculty Approvals Table
    const facultyRows = noDuesRequest.teacherApprovals?.map(ta => [
      ta.teacher?.name,
      ta.subject,
      ta.status.toUpperCase()
    ]) || [];
    nextY = drawTable(doc, '1. Faculty & Lab Clearances', ['Faculty Name', 'Subject', 'Status'], facultyRows, nextY);

    // 2. Account Department Table
    const accountRows = [[
      'Account Section / Fee Clerk',
      noDuesRequest.accountApproval?.status?.toUpperCase() || 'APPROVED'
    ]];
    nextY = drawTable(doc, '2. Accounts Department', ['Authority', 'Status'], accountRows, nextY);

    // 3. HOD Approval Table
    const hodRows = [[
      noDuesRequest.hodApproval?.hod?.name || 'Department HOD',
      noDuesRequest.hodApproval?.status?.toUpperCase() || 'APPROVED'
    ]];
    nextY = drawTable(doc, '3. HOD Approval', ['Authority', 'Status'], hodRows, nextY);

    // 4. Exam Department Table
    const examRows = [[
      'Examiner / Controller',
      noDuesRequest.examApproval?.status?.toUpperCase() || 'APPROVED'
    ]];
    nextY = drawTable(doc, '4. Exam Department', ['Authority', 'Status'], examRows, nextY);

    // --- QR Code for verification (Detailed) ---
    let qrDetails = `VERIFIED NO DUES CERTIFICATE\n`;
    qrDetails += `STUDENT: ${student.name.toUpperCase()}\n`;
    qrDetails += `ENROLLMENT: ${student.enrollment_no}\n`;
    qrDetails += `DEPT: ${student.department?.name}\n`;
    qrDetails += `--------------------------\n`;
    qrDetails += `FACULTY CLEARANCES:\n`;
    noDuesRequest.teacherApprovals?.forEach(ta => {
      qrDetails += `- ${ta.teacher?.name}: ${ta.status.toUpperCase()}\n`;
    });
    qrDetails += `--------------------------\n`;
    qrDetails += `ADMIN CLEARANCES:\n`;
    qrDetails += `- ACCOUNTS: ${noDuesRequest.accountApproval?.status?.toUpperCase() || 'APPROVED'}\n`;
    qrDetails += `- HOD: ${noDuesRequest.hodApproval?.status?.toUpperCase() || 'APPROVED'}\n`;
    qrDetails += `- EXAM: ${noDuesRequest.examApproval?.status?.toUpperCase() || 'APPROVED'}\n`;
    qrDetails += `--------------------------\n`;
    qrDetails += `VALID AS OF: ${new Date().toLocaleDateString()}`;

    const qrBuffer = await QRCode.toBuffer(qrDetails, {
      errorCorrectionLevel: 'M', // Medium for slightly larger data
      type: 'image/png',
      margin: 1,
      width: 500
    });
    
    doc.image(qrBuffer, 435, doc.page.height - 160, { width: 110 });
    doc.fontSize(8).font('Helvetica-Oblique').text('Scan to Verify', 440, doc.page.height - 50, { width: 100, align: 'center' });

    // Footer
    doc.fontSize(9).font('Helvetica').fillColor('#9ca3af').text('This is a digitally generated document. No physical signature is required.', 50, doc.page.height - 70, { align: 'left' });

    doc.end();
  } catch (err) {
    console.error('PDF Generation Error:', err);
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
