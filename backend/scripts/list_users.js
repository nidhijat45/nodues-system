const { User } = require('../models');

async function listAllUsers() {
  try {
    const users = await User.findAll({ attributes: ['name', 'email', 'role', 'is_active'] });
    console.log('All Users in DB:');
    console.table(users.map(u => u.toJSON()));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

listAllUsers();
