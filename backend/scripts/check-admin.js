const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function checkAdmin() {
  try {
    const user = await User.findOne({ where: { email: 'admin@college.com' } });
    if (!user) {
      console.log('Admin user does not exist.');
    } else {
      console.log('Admin user exists:', user.toJSON());
      const isMatch = await bcrypt.compare('password', user.password);
      console.log('Password match:', isMatch);
    }
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

checkAdmin();
