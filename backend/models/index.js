const sequelize = require('../config/db');
const User = require('./User');
const Department = require('./Department');
const Assignment = require('./Assignment');
const LabManual = require('./LabManual');
const NoDuesRequest = require('./NoDuesRequest');
const { DataTypes } = require('sequelize');

// Inline models for submission/approval tables (lightweight)
const AssignmentSubmission = sequelize.define('AssignmentSubmission', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  assignment_id: { type: DataTypes.INTEGER, allowNull: false },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  is_submitted: { type: DataTypes.BOOLEAN, defaultValue: false },
  submitted_at: { type: DataTypes.DATE },
}, { timestamps: false, tableName: 'assignment_submissions' });

const LabManualSubmission = sequelize.define('LabManualSubmission', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  lab_manual_id: { type: DataTypes.INTEGER, allowNull: false },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  is_submitted: { type: DataTypes.BOOLEAN, defaultValue: false },
  submitted_at: { type: DataTypes.DATE },
}, { timestamps: false, tableName: 'lab_manual_submissions' });

const TeacherApproval = sequelize.define('TeacherApproval', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nodues_request_id: { type: DataTypes.INTEGER, allowNull: false },
  teacher_id: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('pending','approved','rejected'), defaultValue: 'pending' },
  comment: { type: DataTypes.TEXT },
  reviewed_at: { type: DataTypes.DATE },
}, { timestamps: false, tableName: 'teacher_approvals' });

const AccountApproval = sequelize.define('AccountApproval', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nodues_request_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  status: { type: DataTypes.ENUM('pending','approved','rejected'), defaultValue: 'pending' },
  reviewed_by: { type: DataTypes.INTEGER },
  reviewed_at: { type: DataTypes.DATE },
}, { timestamps: false, tableName: 'account_approvals' });

const HODApproval = sequelize.define('HODApproval', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nodues_request_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  hod_id: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('pending','approved','rejected'), defaultValue: 'pending' },
  comment: { type: DataTypes.TEXT },
  reviewed_at: { type: DataTypes.DATE },
}, { timestamps: false, tableName: 'hod_approvals' });

const ExamApproval = sequelize.define('ExamApproval', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nodues_request_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  status: { type: DataTypes.ENUM('pending','approved'), defaultValue: 'pending' },
  reviewed_by: { type: DataTypes.INTEGER },
  reviewed_at: { type: DataTypes.DATE },
  certificate_generated: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: false, tableName: 'exam_approvals' });

// ── Associations ──
User.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
Department.hasMany(User, { foreignKey: 'department_id' });

Assignment.belongsTo(User, { foreignKey: 'teacher_id', as: 'teacher' });
Assignment.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

LabManual.belongsTo(User, { foreignKey: 'teacher_id', as: 'teacher' });
LabManual.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

AssignmentSubmission.belongsTo(Assignment, { foreignKey: 'assignment_id' });
AssignmentSubmission.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
Assignment.hasMany(AssignmentSubmission, { foreignKey: 'assignment_id' });

LabManualSubmission.belongsTo(LabManual, { foreignKey: 'lab_manual_id' });
LabManualSubmission.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
LabManual.hasMany(LabManualSubmission, { foreignKey: 'lab_manual_id' });

NoDuesRequest.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
User.hasMany(NoDuesRequest, { foreignKey: 'student_id', as: 'no_dues_requests' });
TeacherApproval.belongsTo(NoDuesRequest, { foreignKey: 'nodues_request_id' });
TeacherApproval.belongsTo(User, { foreignKey: 'teacher_id', as: 'teacher' });
NoDuesRequest.hasMany(TeacherApproval, { foreignKey: 'nodues_request_id', as: 'teacherApprovals' });

AccountApproval.belongsTo(NoDuesRequest, { foreignKey: 'nodues_request_id' });
NoDuesRequest.hasOne(AccountApproval, { foreignKey: 'nodues_request_id', as: 'accountApproval' });

HODApproval.belongsTo(NoDuesRequest, { foreignKey: 'nodues_request_id' });
HODApproval.belongsTo(User, { foreignKey: 'hod_id', as: 'hod' });
NoDuesRequest.hasOne(HODApproval, { foreignKey: 'nodues_request_id', as: 'hodApproval' });

ExamApproval.belongsTo(NoDuesRequest, { foreignKey: 'nodues_request_id' });
NoDuesRequest.hasOne(ExamApproval, { foreignKey: 'nodues_request_id', as: 'examApproval' });

module.exports = {
  sequelize,
  User, Department, Assignment, LabManual,
  AssignmentSubmission, LabManualSubmission,
  NoDuesRequest, TeacherApproval, AccountApproval, HODApproval, ExamApproval
};