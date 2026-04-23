const PDFDocument = require('pdfkit');
const {
  User, Department, NoDuesRequest,
  ExamApproval, TeacherApproval, AccountApproval, HODApproval
} = require('../models');

// GET - All pending requests for exam department
const getPendingRequests = async (req, res) => {
  try {
    const examApprovals = await ExamApproval.findAll({
      where: { status: 'approved' },
      include: [
        {
          model: NoDuesRequest,
          where: { status: 'approved' },
          include: [
            {
              model: User,
              as: 'student',
              attributes: ['id', 'name', 'enrollment_no', 'mobile', 'semester', 'section', 'department_id'],
              include: [{ model: Department, as: 'department', attributes: ['name', 'code'] }]
            },
            {
              model: TeacherApproval,
              as: 'teacherApprovals',
              include: [{ model: User, as: 'teacher', attributes: ['id', 'name'] }]
            },
            { model: AccountApproval, as: 'accountApproval' },
            {
              model: HODApproval, as: 'hodApproval',
              include: [{ model: User, as: 'hod', attributes: ['id', 'name'] }]
            }
          ]
        }
      ],
      order: [['id', 'ASC']]
    });

    const result = examApprovals.map(a => ({
      approval_id: a.id,
      request_id: a.nodues_request_id,
      status: a.status,
      certificate_generated: a.certificate_generated,
      student: a.NoDuesRequest?.student,
      fee_status: a.NoDuesRequest?.accountApproval?.status,
      hod_status: a.NoDuesRequest?.hodApproval?.status,
      teacher_approvals: a.NoDuesRequest?.teacherApprovals?.map(t => ({
        teacher: t.teacher,
        status: t.status
      }))
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// PATCH - Exam department approves final request
const approveRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const reviewed_by = req.user.id;

    const approval = await ExamApproval.findOne({
      where: { nodues_request_id: requestId }
    });
    if (!approval) return res.status(404).json({ message: 'Request not found.' });
    if (approval.status === 'approved') return res.status(400).json({ message: 'Already approved.' });

    await approval.update({ status: 'approved', reviewed_by, reviewed_at: new Date() });
    await NoDuesRequest.update(
      { status: 'approved', completed_at: new Date() },
      { where: { id: requestId } }
    );

    res.json({ message: 'Request approved. Student can now generate certificate.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// GET - Generate No Dues Certificate PDF
const generateCertificate = async (req, res) => {
  try {
    const { requestId } = req.params;

    const noDuesRequest = await NoDuesRequest.findOne({
      where: { id: requestId, status: 'approved' },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['name', 'enrollment_no', 'semester', 'section', 'department_id'],
          include: [{ model: Department, as: 'department', attributes: ['name', 'code'] }]
        },
        {
          model: TeacherApproval,
          as: 'teacherApprovals',
          include: [{ model: User, as: 'teacher', attributes: ['name', 'designation'] }]
        },
        { model: AccountApproval, as: 'accountApproval' },
        {
          model: HODApproval, as: 'hodApproval',
          include: [{ model: User, as: 'hod', attributes: ['name'] }]
        },
        { model: ExamApproval, as: 'examApproval' }
      ]
    });

    if (!noDuesRequest) {
      return res.status(404).json({ message: 'Approved request not found. Certificate cannot be generated.' });
    }

    const student = noDuesRequest.student;

    // Mark certificate as generated
    await ExamApproval.update(
      { certificate_generated: true },
      { where: { nodues_request_id: requestId } }
    );

    // Generate PDF
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=nodues_${student.enrollment_no}.pdf`);
    doc.pipe(res);

    // ── Header ──
    doc.fontSize(22).font('Helvetica-Bold').text('NO DUES CERTIFICATE', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(12).font('Helvetica').text('College Name Here', { align: 'center' });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.8);

    // ── Student Info ──
    doc.fontSize(13).font('Helvetica-Bold').text('Student Details');
    doc.moveDown(0.3);
    doc.fontSize(11).font('Helvetica');
    doc.text(`Name            : ${student.name}`);
    doc.text(`Enrollment No   : ${student.enrollment_no}`);
    doc.text(`Department      : ${student.department?.name} (${student.department?.code})`);
    doc.text(`Semester        : ${student.semester}`);
    doc.text(`Section         : ${student.section}`);
    doc.moveDown(0.8);

    // ── Approval Details ──
    doc.fontSize(13).font('Helvetica-Bold').text('Approval Details');
    doc.moveDown(0.3);
    doc.fontSize(11).font('Helvetica');

    // Teacher approvals
    noDuesRequest.teacherApprovals?.forEach(ta => {
      doc.text(`Teacher : ${ta.teacher?.name} (${ta.teacher?.designation}) — ${ta.status.toUpperCase()}`);
    });
    doc.moveDown(0.3);

    // Account
    doc.text(`Fee Status      : ${noDuesRequest.accountApproval?.status?.toUpperCase() || 'N/A'}`);
    doc.moveDown(0.3);

    // HOD
    doc.text(`HOD Approval    : ${noDuesRequest.hodApproval?.hod?.name} — ${noDuesRequest.hodApproval?.status?.toUpperCase() || 'N/A'}`);
    doc.moveDown(0.3);

    // Exam
    doc.text(`Exam Dept       : APPROVED`);
    doc.moveDown(0.8);

    // ── Dates ──
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Request Initiated : ${new Date(noDuesRequest.initiated_at).toLocaleDateString('en-IN')}`);
    doc.text(`Completed On      : ${new Date(noDuesRequest.completed_at).toLocaleDateString('en-IN')}`);
    doc.text(`Generated On      : ${new Date().toLocaleDateString('en-IN')}`);
    doc.moveDown(1.5);

    // ── Footer ──
    doc.fontSize(11).font('Helvetica-Bold').text('This certificate confirms that the above student has no dues pending with any department.', { align: 'center' });

    doc.end();
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

module.exports = { getPendingRequests, approveRequest, generateCertificate };
