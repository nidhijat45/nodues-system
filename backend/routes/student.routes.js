const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth.middleware');
const allowRoles = require('../middleware/role.middleware');
const {
  getDashboard,
  getMyAssignments,
  getMyLabManuals,
  getTeachersForRequest,
  submitNoDuesRequest,
  getMyRequests,
  reApplyRequest,
  deleteNoDuesRequest,
} = require('../controllers/student.controller');

const path = require('path');
const multer = require('multer');

// Configure storage for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `nodues_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.use(verifyToken, allowRoles('student'));

// Dashboard info
router.get('/dashboard', getDashboard);

// Assignments & Lab Manuals
router.get('/assignments', getMyAssignments);
router.get('/lab-manuals', getMyLabManuals);

// No Dues Request flow
router.get('/nodues/teachers', getTeachersForRequest);   // teachers list with assignment status
router.post('/nodues/submit', upload.single('document'), submitNoDuesRequest);       // submit request to selected teacher
router.get('/nodues/requests', getMyRequests);            // track all requests
router.delete('/nodues/requests/:approvalId', deleteNoDuesRequest); // delete a pending request
router.post('/nodues/reapply', reApplyRequest);           // re-apply after HOD rejection

module.exports = router;
