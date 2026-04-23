require('dotenv').config();
const { sequelize } = require('../models');

(async () => {
  try {
    await sequelize.query('ALTER TABLE users ADD COLUMN total_fees INT DEFAULT 50000');
    console.log('Added total_fees');
  } catch(e) { console.error('total_fees:', e.message); }
  
  try {
    await sequelize.query('ALTER TABLE users ADD COLUMN paid_fees INT DEFAULT 0');
    console.log('Added paid_fees');
  } catch(e) { console.error('paid_fees:', e.message); }
  
  process.exit();
})();
