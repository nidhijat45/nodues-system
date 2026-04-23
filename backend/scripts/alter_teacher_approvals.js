require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { sequelize } = require('./models');

(async () => {
  try {
    await sequelize.query('ALTER TABLE teacher_approvals ADD COLUMN subject VARCHAR(255) NULL');
    console.log('Added subject column to teacher_approvals');
  } catch(e) { 
    console.error('subject column error:', e.message); 
  }
  
  try {
    await sequelize.query('ALTER TABLE teacher_approvals ADD COLUMN document_url VARCHAR(255) NULL');
    console.log('Added document_url column to teacher_approvals');
  } catch(e) { 
    console.error('document_url column error:', e.message); 
  }
  
  process.exit();
})();
