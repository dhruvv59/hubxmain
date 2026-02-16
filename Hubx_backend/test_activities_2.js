
const API_URL = 'http://localhost:8000/api';

async function runActivitiesTest() {
    console.log('--- STARTING ACTIVITIES TEST SCRIPT ---');

    const post = async (url, data, token) => {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
            const res = await fetch(API_URL + url, {
                method: 'POST',
                headers,
                body: JSON.stringify(data)
            });
            const text = await res.text();
            let json;
            try {
                json = JSON.parse(text);
            } catch (e) {
                console.error(`❌ Failed to parse JSON from ${url}:`, text);
                return { status: res.status, data: text };
            }

            if (!res.ok) {
                console.error(`❌ POST ${url} Failed (${res.status}):`, json);
            }
            return { status: res.status, data: json };
        } catch (e) {
            console.error(`❌ Network/Fetch Error POST ${url}:`, e);
            throw e;
        }
    };

    const get = async (url, token) => {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
            const res = await fetch(API_URL + url, {
                method: 'GET',
                headers
            });
            const text = await res.text();
            let json;
            try {
                json = JSON.parse(text);
            } catch (e) {
                console.error(`❌ Failed to parse JSON from ${url}:`, text);
                return { status: res.status, data: text };
            }

            if (!res.ok) {
                console.error(`❌ GET ${url} Failed (${res.status}):`, json);
            }
            return { status: res.status, data: json };
        } catch (e) {
            console.error(`❌ Network/Fetch Error GET ${url}:`, e);
            throw e;
        }
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

    if (loginTeacher.status !== 200) {
        console.error('Teacher Login Failed');
        return;
    }
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

    if (loginStudent.status !== 200) {
        console.error('Student Login Failed');
        return;
    }
    const studentToken = loginStudent.data.data.accessToken;
    console.log('Student Token Obtained');

    // --- TEACHER FLOW ---
    console.log('\n--- TEACHER ACTIVITY FLOW ---');

    // 1. Create Standard
    console.log('Creating Standard...');
    const stdRes = await post('/teacher/standards', { name: "Class 10" }, teacherToken);
    if (stdRes.status !== 201) return;
    const standardId = stdRes.data.data.id;
    console.log('Standard Created:', standardId);

    // 2. Create Subject
    console.log('Creating Subject...');
    const subRes = await post(`/teacher/standards/${standardId}/subjects`, { name: "Mathematics" }, teacherToken);
    if (subRes.status !== 201) return;
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
        price: 10
    }, teacherToken);
    if (paperRes.status !== 201) return;
    const paperId = paperRes.data.data.id;
    console.log('Paper Created:', paperId);

    // 4. Add Question (Fixing type issue if any)
    console.log('Adding Question (JSON)...');
    const qRes = await post(`/teacher/papers/${paperId}/questions`, {
        text: "What is 2 + 2?",
        type: "MCQ",
        options: JSON.stringify(["1", "2", "3", "4"]),
        correctOption: 3,
        marks: 5,
        explanation: "Simple addition"
    }, teacherToken);

    if (qRes.status === 201) {
        console.log('Question Added:', qRes.data.data.id);
    } else {
        console.warn('Skipping Question verification if failed (might be multipart issue)');
    }

    // 5. Publish Paper
    console.log('Publishing Paper...');
    const pubRes = await post(`/teacher/papers/${paperId}/publish`, {}, teacherToken);
    if (pubRes.status === 200) {
        console.log('Paper Published!');

        // --- STUDENT FLOW ---
        console.log('\n--- STUDENT ACTIVITY FLOW ---');

        // 1. Get Public Papers
        console.log('Fetching Public Papers...');
        const papersRes = await get('/student/public-papers', studentToken);
        if (papersRes.status === 200) {
            const paperFound = papersRes.data.data.papers.find(p => p.id === paperId);
            if (paperFound) {
                console.log('✅ Student can see the new paper!');

                // 2. Start Exam
                console.log('Starting Exam...');
                const startRes = await post(`/exam/start/${paperId}`, {}, studentToken);
                if (startRes.status === 201) {
                    const attemptId = startRes.data.data.id;
                    console.log('Exam Started. Attempt ID:', attemptId);

                    // 3. Answer Question?
                    // Verify questions count

                    // 4. Submit Exam
                    console.log('Submitting Exam...');
                    const submitRes = await post(`/exam/${attemptId}/submit`, {}, studentToken);
                    if (submitRes.status === 200) {
                        console.log('Exam Submitted!');
                    }
                }
            } else {
                console.error('❌ Student CANNOT see the new paper.');
            }
        }
    }

    console.log('\n--- ACTIVITIES TEST FINISHED ---');
}

runActivitiesTest().catch(console.error);
