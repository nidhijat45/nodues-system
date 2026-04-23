const bcrypt = require('bcryptjs');
const { User, Department } = require('./models');

async function seedMissingUsers() {
  const password = await bcrypt.hash('Admin@123', 10);
  
  const usersToSeed = [
    { name: 'Account Staff', email: 'account@college.com', password, role: 'account', is_active: true },
    { name: 'Exam Staff', email: 'exam@college.com', password, role: 'exam', is_active: true },
    { name: 'Paras HOD', email: 'paras@gmail.com', password, role: 'teacher', is_hod: true, is_active: true, department_id: 1 }
  ];

  try {
    for (const userData of usersToSeed) {
      const [user, created] = await User.findOrCreate({
        where: { email: userData.email },
        defaults: userData
      });
      if (created) {
        console.log(`Created user: ${userData.email}`);
      } else {
        console.log(`User already exists: ${userData.email}`);
        await user.update({ is_active: true, is_hod: userData.is_hod || false });
      }
    }

    // Also activate Payal jat
    await User.update({ is_active: true }, { where: { email: 'payal@gmail.com' } });
    console.log('Activated payal@gmail.com');

    process.exit(0);
  } catch (err) {
    console.error('Seed Error:', err);
    process.exit(1);
  }
}

seedMissingUsers();
