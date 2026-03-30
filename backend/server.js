require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth',    require('./routes/auth.routes'));
app.use('/api/admin',   require('./routes/admin.routes'));
app.use('/api/teacher', require('./routes/teacher.routes'));
app.use('/api/student', require('./routes/student.routes'));
app.use('/api/account', require('./routes/account.routes')); // Phase 5
app.use('/api/hod',     require('./routes/hod.routes'));     // Phase 5
app.use('/api/exam',    require('./routes/exam.routes'));     // Phase 5

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log('MySQL connected.');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('DB connection failed:', err));
