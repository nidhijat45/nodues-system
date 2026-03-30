const jwt = require('jsonwebtoken');
const { User } = require('../models');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access denied. No token.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Token se sirf id lo, baaki fresh database se lo
    const user = await User.findOne({ where: { id: decoded.id, is_active: true } });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    req.user = {
      id: user.id,
      role: user.role,
      department_id: user.department_id,
      semester: user.semester,
      section: user.section,
      is_hod: user.is_hod
    };
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = verifyToken;