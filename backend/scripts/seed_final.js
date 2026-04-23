const bcrypt = require('bcryptjs');
const { User } = require('./models');

async function seedData() {
  const password = await bcrypt.hash('Admin@123', 10);
  const deptId = 1; // Computer Science
  const sem = 6;
  const section = 'B';

  try {
    // 1. Seed Teachers
    const teachers = [
      { name: 'Paras Bhanopiya', email: 'paras@gmail.com', password, role: 'teacher', is_hod: true, designation: 'HOD', department_id: deptId, is_active: true },
      { name: 'Sumeet Kothari', email: 'sumeet@college.com', password, role: 'teacher', is_hod: false, designation: 'Compiler Design Faculty', department_id: deptId, is_active: true },
      { name: 'Prakash Mishra', email: 'prakash@college.com', password, role: 'teacher', is_hod: false, designation: 'ML Faculty', department_id: deptId, is_active: true },
      { name: 'Madhu Sharma', email: 'madhu@college.com', password, role: 'teacher', is_hod: false, designation: 'CN Faculty', department_id: deptId, is_active: true }
    ];

    for (const t of teachers) {
      const [user, created] = await User.findOrCreate({
        where: { email: t.email },
        defaults: t
      });
      if (!created) {
        await user.update(t);
        console.log(`Updated teacher: ${t.name}`);
      } else {
        console.log(`Created teacher: ${t.name}`);
      }
    }

    // 2. Seed 10 Students
    for (let i = 1; i <= 10; i++) {
      const studentData = {
        name: `Student ${i}`,
        email: `student${i}@college.com`,
        password: password,
        role: 'student',
        enrollment_no: `0832CS211${String(i).padStart(3, '0')}`,
        semester: sem,
        section: section,
        department_id: deptId,
        is_active: true,
        year: 3
      };

      const [user, created] = await User.findOrCreate({
        where: { email: studentData.email },
        defaults: studentData
      });
      if (!created) {
        await user.update(studentData);
      }
    }
    console.log('Created 10 dummy students for Sem 6 Section B');

    process.exit(0);
  } catch (err) {
    console.error('Seed Error:', err);
    process.exit(1);
  }
}

seedData();
