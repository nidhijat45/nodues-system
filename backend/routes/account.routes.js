const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth.middleware');
const allowRoles = require('../middleware/role.middleware');
const {
  getPendingRequests,
  getApprovedRequests,
  approveStudent,
  rejectStudent,
  getStudentFees,
  updateStudentFees,
} = require('../controllers/account.controller');

router.use(verifyToken, allowRoles('account'));

router.get('/requests/pending', getPendingRequests);
router.get('/requests/approved', getApprovedRequests);
router.patch('/requests/:requestId/approve', approveStudent);
router.patch('/requests/:requestId/reject', rejectStudent);

router.get('/fees', getStudentFees);
router.patch('/fees/:studentId', updateStudentFees);

module.exports = router;
