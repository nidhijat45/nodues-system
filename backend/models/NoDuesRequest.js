const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const NoDuesRequest = sequelize.define('NoDuesRequest', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  status: {
    type: DataTypes.ENUM('draft','pending_teachers','pending_account','pending_hod','pending_exam','approved','rejected'),
    defaultValue: 'draft'
  },
  completed_at: { type: DataTypes.DATE },
}, { timestamps: true, tableName: 'nodues_requests', createdAt: 'initiated_at', updatedAt: false });

module.exports = NoDuesRequest;