
const API_URL = 'http://localhost:8000/api';

async function runTests() {
    console.log('--- STARTING QA TEST SCRIPT (FETCH) ---');

    const post = async (url, data, token) => {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(API_URL + url, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        const json = await res.json();
        return { status: res.status, data: json };
    };

    const get = async (url, token) => {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(API_URL + url, {
            method: 'GET',
            headers
        });
        const json = await res.json();
        return { status: res.status, data: json };
    };

    // 1. Register Student
    const studentEmail = `student_${Date.now()}@test.com`;
    const studentPassword = 'Password123!';
    console.log(`\n1. Registering Student: ${studentEmail}`);

    let result = await post('/auth/register', {
        email: studentEmail,
        password: studentPassword,
        firstName: 'Test',
        lastName: 'Student',
        role: 'STUDENT'
    });

    if (result.status === 201) {
        console.log('✅ Student Registration Success');
    } else {
        console.error('❌ Student Registration Failed:', result.data);
    }

    // 2. Login Student
    console.log('\n2. Logging in Student...');
    let studentToken = '';
    result = await post('/auth/login', {
        email: studentEmail,
        password: studentPassword,
        role: 'student'
    });

    if (result.status === 200) {
        console.log('✅ Student Login Success');
        studentToken = result.data.data.accessToken;
    } else {
        console.error('❌ Student Login Failed:', result.data);
    }

    // 3. Register Teacher
    const teacherEmail = `teacher_${Date.now()}@test.com`;
    const teacherPassword = 'Password123!';
    console.log(`\n3. Registering Teacher: ${teacherEmail}`);

    result = await post('/auth/register', {
        email: teacherEmail,
        password: teacherPassword,
        firstName: 'Test',
        lastName: 'Teacher',
        role: 'TEACHER'
    });

    if (result.status === 201) {
        console.log('✅ Teacher Registration Success');
    } else {
        console.error('❌ Teacher Registration Failed:', result.data);
    }

    // 4. Login Teacher
    console.log('\n4. Logging in Teacher...');
    let teacherToken = '';
    result = await post('/auth/login', {
        email: teacherEmail,
        password: teacherPassword,
        role: 'teacher' // The controller expects 'teacher' or 'organisation'
    });

    if (result.status === 200) {
        console.log('✅ Teacher Login Success');
        teacherToken = result.data.data.accessToken;
    } else {
        console.error('❌ Teacher Login Failed:', result.data);
    }

    // 5. Verify Student Dashboard
    if (studentToken) {
        console.log('\n5. Verifying Student Dashboard Data...');
        result = await get('/student/dashboard', studentToken);
        if (result.status === 200) {
            console.log('✅ Student Dashboard Access Success');
        } else {
            console.error('❌ Student Dashboard Access Failed:', result.data);
        }
    }

    // 6. Verify Teacher Dashboard (Papers)
    if (teacherToken) {
        console.log('\n6. Verifying Teacher Dashboard Data (Papers)...');
        result = await get('/teacher/papers', teacherToken); // Verify paper access
        if (result.status === 200) {
            console.log('✅ Teacher Papers Access Success');
        } else {
            console.error('❌ Teacher Papers Access Failed:', result.data);
        }
    }

    console.log('\n--- QA TEST SCRIPT FINISHED ---');
}

runTests();
