const bcrypt = require('bcryptjs');

async function testHashes() {
  const hash = '$2b$10$gylRaGerwD8lVZN9Je4iHu6VzhmYZIBVdKMscZireTe5hscEj5guy';
  const attempts = ['password', '123456', '12345678', 'paras', 'paras123', 'admin', 'teacher', 'admin123', 'admin@123', 'paras@123'];
  for (const pass of attempts) {
    if (await bcrypt.compare(pass, hash)) {
      console.log('Password is:', pass);
      return;
    }
  }
  console.log('Could not guess the password.');
}

testHashes();
