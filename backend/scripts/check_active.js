const { User } = require('../models');

async function checkUserActive() {
  try {
    const user = await User.findOne({ where: { email: 'admin@college.com' } });
    if (user) {
      console.log('User found:');
      console.log('Name:', user.name);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Is Active:', user.is_active);
      
      if (!user.is_active) {
        console.log('User is NOT active. Activating now...');
        await user.update({ is_active: true });
        console.log('User activated successfully.');
      }
    } else {
      console.log('User admin@college.com not found.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error checking user:', err);
    process.exit(1);
  }
}

checkUserActive();
