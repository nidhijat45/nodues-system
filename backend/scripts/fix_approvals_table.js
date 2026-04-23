const sequelize = require('./config/db');

async function fixTeacherApprovals() {
  try {
    console.log('Checking teacher_approvals table...');
    const [results] = await sequelize.query("DESCRIBE teacher_approvals");
    const fields = results.map(r => r.Field);
    
    if (!fields.includes('subject')) {
      console.log('Column "subject" missing. Adding it...');
      await sequelize.query("ALTER TABLE teacher_approvals ADD COLUMN subject VARCHAR(255) AFTER teacher_id");
    }
    
    if (!fields.includes('document_url')) {
      console.log('Column "document_url" missing. Adding it...');
      await sequelize.query("ALTER TABLE teacher_approvals ADD COLUMN document_url VARCHAR(255) AFTER subject");
    }
    
    console.log('Table teacher_approvals fixed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error fixing teacher_approvals:', err);
    process.exit(1);
  }
}

fixTeacherApprovals();
