const { User } = require('../models');

async function resetParas() {
  try {
    const user = await User.findOne({ where: { email: 'paras@college.com' } });
    if (!user) {
      console.log('User not found.');
    } else {
      user.password = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
      await user.save();
      console.log('Successfully reset paras@college.com password to "password".');
    }
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

resetParas();
