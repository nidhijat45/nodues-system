const sequelize = require('./config/db');

async function checkSchema() {
  const tables = [
    'users', 'departments', 'assignments', 'assignment_submissions',
    'lab_manuals', 'lab_manual_submissions', 'nodues_requests',
    'teacher_approvals', 'account_approvals', 'hod_approvals', 'exam_approvals'
  ];

  try {
    for (const table of tables) {
      console.log(`\n--- Table: ${table} ---`);
      const [results] = await sequelize.query(`DESCRIBE ${table}`);
      console.table(results.map(r => ({ Field: r.Field, Type: r.Type })));
    }
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkSchema();
