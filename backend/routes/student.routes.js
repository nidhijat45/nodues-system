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
} = require('../controllers/student.controller');

router.use(verifyToken, allowRoles('student'));

// Dashboard info
router.get('/dashboard', getDashboard);

// Assignments & Lab Manuals
router.get('/assignments', getMyAssignments);
router.get('/lab-manuals', getMyLabManuals);

// No Dues Request flow
router.get('/nodues/teachers', getTeachersForRequest);   // teachers list with assignment status
router.post('/nodues/submit', submitNoDuesRequest);       // submit request to selected teachers
router.get('/nodues/requests', getMyRequests);            // track all requests
router.post('/nodues/reapply', reApplyRequest);           // re-apply after HOD rejection

module.exports = router;
