const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth.middleware');
const allowRoles = require('../middleware/role.middleware');
const {
  getPendingRequests,
  approveRequest,
  rejectRequest,
  getDepartmentReport,
} = require('../controllers/hod.controller');

router.use(verifyToken, allowRoles('teacher'));

router.get('/requests', getPendingRequests);
router.patch('/requests/:requestId/approve', approveRequest);
router.patch('/requests/:requestId/reject', rejectRequest);
router.get('/reports', getDepartmentReport);

module.exports = router;
