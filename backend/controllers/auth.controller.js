const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Department } = require('../models');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, department_id: user.department_id, is_hod: user.is_hod },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Login — works for ALL roles
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required.' });
    
    console.log(`Login attempt for email: "${email}"`);

    if (!process.env.JWT_SECRET) {
      console.error('CRITICAL: JWT_SECRET is not defined in environment.');
      return res.status(500).json({ message: 'Server configuration error: JWT_SECRET missing.' });
    }

    const trimmedEmail = email.trim();
    const user = await User.findOne({ where: { email: trimmedEmail, is_active: true } });
    if (!user) {
      console.log('Login failed: User not found or inactive');
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Login failed: Incorrect password');
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    console.log('Password matched. Generating token...');
    const token = generateToken(user);
    console.log('Token generated successfully.');

    res.json({
      token,
      user: {
        id: user.id, name: user.name, email: user.email,
        role: user.role, department_id: user.department_id,
        semester: user.semester, section: user.section,
        enrollment_no: user.enrollment_no, is_hod: user.is_hod
      }
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Student self-registration
const registerStudent = async (req, res) => {
  try {
    const { name, email, password, mobile, enrollment_no, department_id, semester, section, year } = req.body;

    // Validation
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobile || !mobileRegex.test(mobile)) {
      return res.status(400).json({ message: 'Mobile number must be 10 digits and start with 6, 7, 8, or 9.' });
    }

    const trimmedName = (name || '').trim();
    if (trimmedName.split(' ').filter(Boolean).length < 2) {
      return res.status(400).json({ message: 'Please enter your full name (including surname).' });
    }

    const enrollRegex = /^0832[A-Za-z]{2}\d{6}$/;
    if (!enrollRegex.test(enrollment_no)) {
      return res.status(400).json({ message: 'Enrollment number must start with 0832, followed by 2 letters and 6 digits.' });
    }

    const dept = await Department.findByPk(department_id);
    if (!dept) {
      return res.status(400).json({ message: 'Invalid department selected.' });
    }

    const enrollBranch = enrollment_no.substring(4, 6).toUpperCase();
    const deptPrefix = dept.code.substring(0, 2).toUpperCase();
    if (enrollBranch !== deptPrefix) {
      return res.status(400).json({ message: `Enrollment branch (${enrollBranch}) does not match department prefix (${deptPrefix}).` });
    }

    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#@$!%*?&])[A-Za-z\d#@$!%*?&]{8,}$/;
    if (!passRegex.test(password)) {
      return res.status(400).json({ message: 'Password must be 8+ chars, have 1 uppercase, 1 lowercase, 1 number, and 1 symbol (including #).' });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ message: 'Email already registered.' });

    const enrollExists = await User.findOne({ where: { enrollment_no } });
    if (enrollExists) return res.status(409).json({ message: 'Enrollment number already exists.' });

    if (mobile) {
      const mobileExists = await User.findOne({ where: { mobile } });
      if (mobileExists) return res.status(409).json({ message: 'Mobile number already exists.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const student = await User.create({
      name, email, password: hashed, mobile,
      role: 'student', enrollment_no, department_id,
      semester, section, year,
      is_active: false // Approval required
    });

    res.status(201).json({ 
      message: 'Registration successful! Please wait for admin approval before logging in.' 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect old password.' });

    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#@$!%*?&])[A-Za-z\d#@$!%*?&]{8,}$/;
    if (!passRegex.test(newPassword)) {
      return res.status(400).json({ message: 'New password must have 8+ chars, 1 uppercase, 1 lowercase, 1 number, and 1 symbol.' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashed });

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

module.exports = { login, registerStudent, changePassword };