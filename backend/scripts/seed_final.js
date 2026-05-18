const bcrypt = require('bcryptjs');
const { User, Department, sequelize } = require('../models');

async function seedData() {
  const password = await bcrypt.hash('Admin@123', 10);
  const deptId = 1; // Computer Science
  const sem = 6;
  const section = 'B';

  try {
    await sequelize.sync({ alter: true }); // Create tables if not exist
    console.log('Database synced successfully.');

    // 0. Seed Departments
    const [dept, createdDept] = await Department.findOrCreate({
      where: { id: 1 },
      defaults: { id: 1, name: 'Computer Science', code: 'CSE' }
    });
    console.log(createdDept ? 'Created Computer Science department.' : 'Department exists.');

    // 1. Seed Staff (Admin, Account, Exam)
    const staff = [
      { name: 'Admin', email: 'admin@gmail.com', password, role: 'admin', is_active: true },
      { name: 'Account Staff', email: 'account@gmail.com', password, role: 'account', is_active: true },
      { name: 'Exam Staff', email: 'exam@gmail.com', password, role: 'exam', is_active: true }
    ];

    for (const s of staff) {
      const [user, created] = await User.findOrCreate({
        where: { email: s.email },
        defaults: s
      });
      if (!created) await user.update(s);
      console.log(`Created/Updated staff: ${s.name}`);
    }

    // 2. Seed Teachers
    const teachers = [
      { name: 'Paras Bhanopiya', email: 'paras@gmail.com', password, role: 'teacher', is_hod: true, designation: 'HOD', department_id: deptId, is_active: true },
      { name: 'Sumeet Kothari', email: 'sumeet@gmail.com', password, role: 'teacher', is_hod: false, designation: 'Compiler Design Faculty', department_id: deptId, is_active: true },
      { name: 'Prakash Mishra', email: 'prakash@gmail.com', password, role: 'teacher', is_hod: false, designation: 'ML Faculty', department_id: deptId, is_active: true },
      { name: 'Madhu Sharma', email: 'madhu@gmail.com', password, role: 'teacher', is_hod: false, designation: 'CN Faculty', department_id: deptId, is_active: true },
      { name: 'Vikrant Sharma', email: 'teacher@gmail.com', password, role: 'teacher', is_hod: false, designation: 'Faculty', department_id: deptId, is_active: true }
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

    // 3. Seed Payal Jat
    const payalData = {
      name: 'Payal Jat',
      email: 'payal@gmail.com',
      password: password,
      role: 'student',
      enrollment_no: '0832CS211000',
      semester: sem,
      section: section,
      department_id: deptId,
      is_active: true,
      year: 3
    };
    const [payal, createdPayal] = await User.findOrCreate({
      where: { email: payalData.email },
      defaults: payalData
    });
    if (!createdPayal) await payal.update(payalData);
    console.log('Created student: Payal Jat');

    // 4. Seed 10 Students
    for (let i = 1; i <= 10; i++) {
      const studentData = {
        name: `Student ${i}`,
        email: `student${i}@gmail.com`,
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

    // 5. Remove old credentials (cleanup users not in the list)
    const { Op } = require('sequelize');
    const allowedEmails = [
      'admin@gmail.com', 'account@gmail.com', 'exam@gmail.com',
      'paras@gmail.com', 'sumeet@gmail.com', 'prakash@gmail.com',
      'madhu@gmail.com', 'teacher@gmail.com', 'payal@gmail.com'
    ];
    for (let i = 1; i <= 10; i++) allowedEmails.push(`student${i}@gmail.com`);

    const deleted = await User.destroy({
      where: { email: { [Op.notIn]: allowedEmails } }
    });
    console.log(`Removed ${deleted} old login credentials from database.`);

    process.exit(0);
  } catch (err) {
    console.error('Seed Error:', err);
    process.exit(1);
  }
}

seedData();
