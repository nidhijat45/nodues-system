// Native fetch used

async function testReg(payload, expectedStatus) {
  const res = await fetch("http://localhost:5000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  console.log(`Payload Name: ${payload.name}, Enroll: ${payload.enrollment_no}`);
  console.log(`Expected: ${expectedStatus}, Got: ${res.status}`);
  console.log(`Response: ${data.message || 'Success'}\n`);
}

async function runTests() {
  const base = {
    name: 'John Doe',
    email: `test${Date.now()}@college.com`,
    password: 'Password@123',
    mobile: `99${Date.now()}`.substring(0, 10),
    enrollment_no: '0832CS123456',
    department_id: 1, // CS
    semester: 1,
    section: 'A',
    year: 1
  };

  // 1. Success
  await testReg(base, 201);

  // 2. Bad name
  await testReg({ ...base, name: 'John', email: `test${Date.now()}@college.com`, enrollment_no: '0832CS123457' }, 400);

  // 3. Bad enrollment format
  await testReg({ ...base, enrollment_no: '0831CS123456', email: `test${Date.now()}@college.com` }, 400);

  // 4. Bad branch
  await testReg({ ...base, enrollment_no: '0832IT123456', email: `test${Date.now()}@college.com` }, 400);

  // 5. Bad password
  await testReg({ ...base, password: 'password', email: `test${Date.now()}@college.com`, enrollment_no: '0832CS123458' }, 400);

  // 6. Duplicate email
  await testReg({ ...base, email: base.email, enrollment_no: '0832CS123459' }, 409);

  // 7. Duplicate enroll
  await testReg({ ...base, email: `test${Date.now()}@college.com`, enrollment_no: base.enrollment_no }, 409);

  // 8. Duplicate mobile
  await testReg({ ...base, email: `test${Date.now()}@college.com`, enrollment_no: '0832CS123459', mobile: base.mobile }, 409);
}

runTests();
