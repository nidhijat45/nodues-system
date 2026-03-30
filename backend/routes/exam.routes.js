const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth.middleware');
const allowRoles = require('../middleware/role.middleware');
const {
  getPendingRequests,
  approveRequest,
  generateCertificate,
} = require('../controllers/exam.controller');

router.use(verifyToken, allowRoles('exam'));

router.get('/requests', getPendingRequests);
router.patch('/requests/:requestId/approve', approveRequest);
router.get('/requests/:requestId/certificate', generateCertificate);

module.exports = router;
