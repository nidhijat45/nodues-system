const { User, Assignment, Department } = require('../models');

async function testFetch() {
  const student = await User.findOne({ where: { role: 'student', is_active: true } });
  if (!student) {
    console.log("No student found");
    return;
  }
  console.log("Student:", { id: student.id, name: student.name, department_id: student.department_id, semester: student.semester, section: student.section, year: student.year });

  const teacher = await User.findOne({ where: { role: 'teacher', is_active: true } });
  if (!teacher) {
    console.log("No teacher found to make assignment");
    return;
  }

  // create a test assignment explicitly matching student
  const assignment = await Assignment.create({
    teacher_id: teacher.id,
    department_id: student.department_id,
    semester: student.semester,
    section: student.section,
    subject_name: 'Test Subject',
    assignment_name: 'Test Assignment',
    given_date: new Date(),
    due_date: new Date(Date.now() + 86400000),
    is_active: true
  });
  console.log("Created assignment:", assignment.toJSON());

  // simulate fetch
  const assignments = await Assignment.findAll({
    where: { 
      department_id: student.department_id, 
      semester: student.semester, 
      section: student.section, 
      is_active: true 
    }
  });

  console.log("Fetched assignments sum:", assignments.length);
  process.exit(0);
}

testFetch();
