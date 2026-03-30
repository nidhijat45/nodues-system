const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth.middleware');
const allowRoles = require('../middleware/role.middleware');
const {
  getPendingRequests,
  approveRequest,
  rejectRequest,
} = require('../controllers/hod.controller');

router.use(verifyToken, allowRoles('teacher'));

router.get('/requests', getPendingRequests);
router.patch('/requests/:requestId/approve', approveRequest);
router.patch('/requests/:requestId/reject', rejectRequest);

module.exports = router;
