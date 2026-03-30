const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Assignment = sequelize.define('Assignment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  teacher_id: { type: DataTypes.INTEGER, allowNull: false },
  department_id: { type: DataTypes.INTEGER, allowNull: false },
  semester: { type: DataTypes.TINYINT, allowNull: false },
  section: { type: DataTypes.STRING(5), allowNull: false },
  subject_name: { type: DataTypes.STRING(100), allowNull: false },
  assignment_name: { type: DataTypes.STRING(150), allowNull: false },
  given_date: { type: DataTypes.DATEONLY, allowNull: false },
  due_date: { type: DataTypes.DATEONLY, allowNull: false },
  file_path: { type: DataTypes.STRING(255) },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { timestamps: true, tableName: 'assignments', createdAt: 'created_at', updatedAt: false });

module.exports = Assignment;