const { Department } = require('../models');

async function checkDepts() {
  try {
    const depts = await Department.findAll();
    console.log('Departments:');
    console.table(depts.map(d => d.toJSON()));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkDepts();
