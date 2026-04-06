const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth.middleware');
const allowRoles = require('../middleware/role.middleware');
const {
  getDepartments,
  addTeacher, getAllTeachers, updateTeacher, deleteTeacher,
  getAllStudents, addStudent, updateStudent, deleteStudent,
  addStaff, getAllStaff, updateStaff, deleteStaff,
  getOverview, downloadStudentReport, downloadStaffReport
} = require('../controllers/admin.controller');

router.get('/departments', getDepartments);

router.use(verifyToken, allowRoles('admin'));

// Teachers
router.post('/teachers', addTeacher);
router.get('/teachers', getAllTeachers);
router.put('/teachers/:id', updateTeacher);
router.delete('/teachers/:id', deleteTeacher);

// Students
router.post('/students', addStudent);
router.get('/students', getAllStudents);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);

// Staff
router.post('/staff', addStaff);
router.get('/staff', getAllStaff);
router.put('/staff/:id', updateStaff);
router.delete('/staff/:id', deleteStaff);

// Reports
router.get('/overview', getOverview);
router.get('/export/students', downloadStudentReport);
router.get('/export/staff', downloadStaffReport);

module.exports = router;