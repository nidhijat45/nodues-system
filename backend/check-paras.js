const { User } = require('./models');

async function checkUser() {
  try {
    const user = await User.findOne({ where: { email: 'paras@college.com' } });
    if (!user) {
      console.log('User not found in the database.');
    } else {
      console.log('User details:', user.toJSON());
      // The hash will tell us if it uses the same default '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
    }
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

checkUser();
