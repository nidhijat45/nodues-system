const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const verifyToken = require('../middleware/auth.middleware');
const allowRoles = require('../middleware/role.middleware');
const {
  // Assignments
  addAssignment, getAssignments, updateAssignment, deleteAssignment,
  // Lab Manuals
  addLabManual, getLabManuals, updateLabManual, deleteLabManual,
  // Student lists & submissions
  getStudentList, markAssignmentSubmitted, markLabManualSubmitted,
  // Reports
  exportAssignmentReport, exportLabManualReport,
  // No Dues Requests
  getRequests, approveRequest, rejectRequest,
} = require('../controllers/teacher.controller');

// Multer setup for assignment file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// All routes require teacher role
router.use(verifyToken, allowRoles('teacher'));

// ── Assignments ──
router.post('/assignments', upload.single('file'), addAssignment);
router.get('/assignments', getAssignments);
router.put('/assignments/:id', upload.single('file'), updateAssignment);
router.delete('/assignments/:id', deleteAssignment);

// ── Lab Manuals ──
router.post('/lab-manuals', addLabManual);
router.get('/lab-manuals', getLabManuals);
router.put('/lab-manuals/:id', updateLabManual);
router.delete('/lab-manuals/:id', deleteLabManual);

// ── Student List & Submission Tracking ──
router.get('/students', getStudentList);
router.patch('/assignments/:assignmentId/students/:studentId/submit', markAssignmentSubmitted);
router.patch('/lab-manuals/:labManualId/students/:studentId/submit', markLabManualSubmitted);

// ── Reports (Excel Export) ──
router.get('/assignments/:assignmentId/export', exportAssignmentReport);
router.get('/lab-manuals/:labManualId/export', exportLabManualReport);

// ── No Dues Requests ──
router.get('/requests', getRequests);
router.patch('/requests/:requestId/approve', approveRequest);
router.patch('/requests/:requestId/reject', rejectRequest);

module.exports = router;
