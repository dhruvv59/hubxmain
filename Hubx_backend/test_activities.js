
const API_URL = 'https://server.zapmark.in/api';

async function runActivitiesTest() {
    console.log('--- STARTING ACTIVITIES TEST SCRIPT ---');

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

    // --- SETUP TEACHER ---
    const teacherEmail = `teacher_act_${Date.now()}@test.com`;
    console.log(`\n1. Registering Teacher: ${teacherEmail}`);
    await post('/auth/register', {
        email: teacherEmail,
        password: 'Password123!',
        firstName: 'Teach',
        lastName: 'Er',
        role: 'TEACHER'
    });

    const loginTeacher = await post('/auth/login', {
        email: teacherEmail,
        password: 'Password123!',
        role: 'teacher'
    });
    const teacherToken = loginTeacher.data.data.accessToken;
    console.log('Teacher Token Obtained');

    // --- SETUP STUDENT ---
    const studentEmail = `student_act_${Date.now()}@test.com`;
    console.log(`\n2. Registering Student: ${studentEmail}`);
    await post('/auth/register', {
        email: studentEmail,
        password: 'Password123!',
        firstName: 'Stu',
        lastName: 'Dent',
        role: 'STUDENT'
    });

    const loginStudent = await post('/auth/login', {
        email: studentEmail,
        password: 'Password123!',
        role: 'student'
    });
    const studentToken = loginStudent.data.data.accessToken;
    console.log('Student Token Obtained');

    // --- TEACHER FLOW ---
    console.log('\n--- TEACHER ACTIVITY FLOW ---');

    // 1. Create Standard
    console.log('Creating Standard...');
    const stdRes = await post('/teacher/standards', { name: "Class 10" }, teacherToken);
    if (stdRes.status !== 201) throw new Error('Failed to create standard: ' + JSON.stringify(stdRes.data));
    const standardId = stdRes.data.data.id;
    console.log('Standard Created:', standardId);

    // 2. Create Subject
    console.log('Creating Subject...');
    const subRes = await post(`/teacher/standards/${standardId}/subjects`, { name: "Mathematics" }, teacherToken);
    if (subRes.status !== 201) throw new Error('Failed to create subject: ' + JSON.stringify(subRes.data));
    const subjectId = subRes.data.data.id;
    console.log('Subject Created:', subjectId);

    // 3. Create Paper
    console.log('Creating Paper...');
    const paperRes = await post('/teacher/papers', {
        title: "Math Final Exam 2026",
        description: "Comprehensive test",
        standard: 10,
        subjectId: subjectId,
        difficulty: "MEDIUM",
        type: "TIME_BOUND",
        duration: 60,
        isPublic: true,
        price: 0
    }, teacherToken);
    if (paperRes.status !== 201) throw new Error('Failed to create paper: ' + JSON.stringify(paperRes.data));
    const paperId = paperRes.data.data.id;
    console.log('Paper Created:', paperId);

    // 4. Add Question
    console.log('Adding Question...');
    // Note: Multipart/form-data is usually needed for questions with images, 
    // but the backend controller seems to parse body properties if files are missing.
    // Let's try sending JSON first.
    const qRes = await post(`/teacher/papers/${paperId}/questions`, {
        text: "What is 2 + 2?",
        type: "MCQ",
        options: JSON.stringify(["1", "2", "3", "4"]),
        correctOption: 3, // Index 3 is "4"
        marks: 5,
        explanation: "Simple addition"
    }, teacherToken);

    if (qRes.status !== 201) {
        console.error('Question Creation potentially failed (might need multipart):', qRes.data);
        // If this fails, we might need to skip or use a more complex fetch for multipart
    } else {
        console.log('Question Added:', qRes.data.data.id);
    }

    // 5. Publish Paper
    console.log('Publishing Paper...');
    const pubRes = await post(`/teacher/papers/${paperId}/publish`, {}, teacherToken);
    if (pubRes.status !== 200) console.error('Failed to publish paper:', pubRes.data);
    else console.log('Paper Published!');

    // --- STUDENT FLOW ---
    console.log('\n--- STUDENT ACTIVITY FLOW ---');

    // 1. Get Public Papers
    console.log('Fetching Public Papers...');
    const papersRes = await get('/student/published-papers', studentToken);
    const paperFound = papersRes.data.data.papers.find(p => p.id === paperId);

    if (paperFound) {
        console.log('✅ Student can see the new paper!');

        // 2. Start Exam
        console.log('Starting Exam...');
        const startRes = await post(`/exam/start/${paperId}`, {}, studentToken);
        if (startRes.status === 201) {
            const attemptId = startRes.data.data.id;
            console.log('Exam Started. Attempt ID:', attemptId);

            // 3. Submit Exam
            console.log('Submitting Exam...');
            const submitRes = await post(`/exam/${attemptId}/submit`, {}, studentToken);
            console.log('Exam Submitted:', submitRes.status);

        } else {
            console.error('Failed to start exam:', startRes.data);
        }

    } else {
        console.error('❌ Student CANNOT see the new paper. Filters or caching issue?');
        // Log all papers to see what's there
        // console.log('All papers:', papersRes.data.data.papers);
    }

    console.log('\n--- ACTIVITIES TEST FINISHED ---');
}

runActivitiesTest().catch(console.error);
