require('dotenv').config();
const { User, Department, NoDuesRequest } = require('./models');

(async () => {
  try {
    const students = await User.findAll({
      where: { role: 'student' },
      include: [
        { model: Department, as: 'department', attributes: ['name', 'code'] },
        { model: NoDuesRequest, as: 'no_dues_requests', attributes: ['status', 'requested_at'] }
      ]
    });
    console.log("Success! Found", students.length, "students.");
  } catch(e) {
    console.error("ERROR!!", e);
  }
  process.exit();
})();
