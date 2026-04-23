const bcrypt = require('bcryptjs');
const { User } = require('../models');

async function resetAdminPassword() {
  const newPassword = 'Admin@123';
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const [updated] = await User.update(
      { password: hashedPassword },
      { where: { email: 'admin@college.com' } }
    );

    if (updated) {
      console.log('Successfully reset password for admin@college.com to: ' + newPassword);
    } else {
      console.log('Admin user not found or password already matches.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error resetting password:', err);
    process.exit(1);
  }
}

resetAdminPassword();
