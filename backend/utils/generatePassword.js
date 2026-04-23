const generatePassword = () => {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const symbols = '#@$!%*?&';
  const all = upper + lower + digits + symbols;

  let pass = '';
  // Ensure at least one of each required type
  pass += upper[Math.floor(Math.random() * upper.length)];
  pass += lower[Math.floor(Math.random() * lower.length)];
  pass += digits[Math.floor(Math.random() * digits.length)];
  pass += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill the rest to 10 characters
  for (let i = 0; i < 6; i++) {
    pass += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle the password
  return pass.split('').sort(() => 0.5 - Math.random()).join('');
};

module.exports = generatePassword;
