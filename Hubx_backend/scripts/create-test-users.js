/**
 * Creates one STUDENT and one TEACHER user via /api/auth/register for E2E testing.
 * Run with: node scripts/create-test-users.js
 * Requires backend running on http://localhost:8000
 */

const API = 'https://server.zapmark.in/api';

const student = {
  email: 'e2e.student@hubx-test.com',
  password: 'TestStudent123!',
  firstName: 'E2E',
  lastName: 'Student',
  role: 'STUDENT',
};

const teacher = {
  email: 'e2e.teacher@hubx-test.com',
  password: 'TestTeacher123!',
  firstName: 'E2E',
  lastName: 'Teacher',
  role: 'TEACHER',
};

async function register(body) {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 409 && data.message?.includes('already exists')) {
      return { skipped: true, message: 'User already exists' };
    }
    throw new Error(data.message || `HTTP ${res.status}`);
  }
  return data;
}

async function main() {
  console.log('Creating E2E test users (backend must be running on :8000)...\n');

  try {
    const studentResult = await register(student);
    if (studentResult.skipped) {
      console.log('Student:', student.email, '- already exists (skipped)');
    } else {
      console.log('Student created:', student.email);
    }

    const teacherResult = await register(teacher);
    if (teacherResult.skipped) {
      console.log('Teacher:', teacher.email, '- already exists (skipped)');
    } else {
      console.log('Teacher created:', teacher.email);
    }

    console.log('\nLogin credentials for testing:');
    console.log('--- STUDENT ---');
    console.log('  Email:', student.email);
    console.log('  Password:', student.password);
    console.log('--- TEACHER ---');
    console.log('  Email:', teacher.email);
    console.log('  Password:', teacher.password);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
