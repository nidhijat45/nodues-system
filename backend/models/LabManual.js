const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const LabManual = sequelize.define('LabManual', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  teacher_id: { type: DataTypes.INTEGER, allowNull: false },
  department_id: { type: DataTypes.INTEGER, allowNull: false },
  semester: { type: DataTypes.TINYINT, allowNull: false },
  subject_name: { type: DataTypes.STRING(100), allowNull: false },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { timestamps: true, tableName: 'lab_manuals', createdAt: 'created_at', updatedAt: false });

module.exports = LabManual;