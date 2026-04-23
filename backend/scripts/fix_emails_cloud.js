const { sequelize, User } = require('../models');
const { Op } = require('sequelize');

async function fixEmails() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to Cloud Database.');

    // Find all users with college.com emails
    const users = await User.findAll({
      where: {
        email: {
          [Op.like]: '%@college.com'
        }
      }
    });

    console.log(`Found ${users.length} users with @college.com emails.`);

    for (const user of users) {
      const newEmail = user.email.replace('@college.com', '@gmail.com');
      await user.update({ email: newEmail });
      console.log(`Updated: ${user.name} -> ${newEmail}`);
    }

    console.log('\n✨ All emails updated to @gmail.com successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating emails:', err);
    process.exit(1);
  }
}

fixEmails();
