const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  mobile: { type: DataTypes.STRING(15) },
  role: { type: DataTypes.ENUM('admin','teacher','student','account','exam'), allowNull: false },
  department_id: { type: DataTypes.INTEGER },
  enrollment_no: { type: DataTypes.STRING(20) },
  semester: { type: DataTypes.TINYINT },
  section: { type: DataTypes.STRING(5) },
  year: { type: DataTypes.TINYINT },  
  designation: { type: DataTypes.STRING(50) },
  is_hod: { type: DataTypes.BOOLEAN, defaultValue: false },
  total_fees: { type: DataTypes.INTEGER, defaultValue: 50000 },
  paid_fees: { type: DataTypes.INTEGER, defaultValue: 0 },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { timestamps: true, tableName: 'users', createdAt: 'created_at', updatedAt: false });

module.exports = User;