const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: process.env.DB_PORT,
    logging: false,
    dialectOptions: process.env.DB_HOST !== 'localhost' ? {
      ssl: {
        rejectUnauthorized: false, // Required for Aiven/Cloud MySQL
      }
    } : {}
  }
);

module.exports = sequelize;