import "dotenv/config"
import prisma from "../config/database"

async function testFullSystem() {
    try {
        console.log("🔍 Getting System Setup Information...\n")
        console.log("═══════════════════════════════════════════════════════")
        console.log("ORGANIZATIONS, TEACHERS & STUDENTS")
        console.log("═══════════════════════════════════════════════════════\n")

        // Get all organizations
        const organizations = await prisma.organization.findMany({
            include: {
                memberships: {
                    include: {
                        user: true,
                    },
                },
            },
        })

        if (organizations.length === 0) {
            console.log("❌ No organizations found in database!")
            console.log("\nYou need to:")
            console.log("1. Create an Organization (School)")
            console.log("2. Add Teacher to the organization")
            console.log("3. Add Students to the organization")
            process.exit(1)
        }

        let foundTeacherWithStudents = false

        for (const org of organizations) {
            console.log(`\n${"=".repeat(60)}`)
            console.log(`📍 SCHOOL: ${org.name}`)
            console.log(`${"=".repeat(60)}`)
            console.log(`ID: ${org.id}`)
            console.log(`Status: ${org.isActive ? "✅ Active" : "❌ Inactive"}`)
            console.log(`Created: ${org.createdAt}`)

            const teachers = org.memberships.filter((m: any) => m.role === "TEACHER")
            const students = org.memberships.filter((m: any) => m.role === "STUDENT")

            console.log(`\n👨‍🏫 TEACHERS (${teachers.length}):`)
            if (teachers.length === 0) {
                console.log("   ❌ No teachers found")
            } else {
                teachers.forEach((teacher: any) => {
                    console.log(`   ✏️  ID: ${teacher.userId}`)
                    console.log(`       Name: ${teacher.user.firstName} ${teacher.user.lastName}`)
                    console.log(`       Email: ${teacher.user.email}`)
                    console.log(`       Status: ${teacher.isActive ? "✅ Active" : "❌ Inactive"}`)
                    console.log()
                })
            }

            console.log(`\n👨‍🎓 STUDENTS (${students.length}):`)
            if (students.length === 0) {
                console.log("   ❌ No students found")
            } else {
                students.slice(0, 5).forEach((student: any) => {
                    console.log(`   👤 ID: ${student.userId}`)
                    console.log(`      Name: ${student.user.firstName} ${student.user.lastName}`)
                    console.log(`      Email: ${student.user.email}`)
                    console.log(`      Status: ${student.isActive ? "✅ Active" : "❌ Inactive"}`)
                    console.log()
                })

                if (students.length > 5) {
                    console.log(`   ... and ${students.length - 5} more students\n`)
                }

                if (teachers.length > 0) {
                    foundTeacherWithStudents = true
                }
            }
        }

        console.log(`\n${"=".repeat(60)}`)
        console.log(`📧 FREE PAPER SYSTEM TEST`)
        console.log(`${"=".repeat(60)}\n`)

        if (!foundTeacherWithStudents) {
            console.log("❌ No organization found with both teacher and students!")
            console.log("\nYou need to:")
            console.log("1. Create at least 1 Teacher")
            console.log("2. Create at least 1 Student")
            console.log("3. Add them to SAME organization")
            process.exit(1)
        }

        // Get first organization with teacher and students
        const testOrg = organizations.find((org: any) => {
            const hasTeacher = org.memberships.some((m: any) => m.role === "TEACHER" && m.isActive)
            const hasStudents = org.memberships.some((m: any) => m.role === "STUDENT" && m.isActive)
            return hasTeacher && hasStudents
        })

        if (!testOrg) {
            console.log("❌ Could not find suitable organization for testing!")
            process.exit(1)
        }

        const teacher = testOrg.memberships.find((m: any) => m.role === "TEACHER" && m.isActive) as any
        const students = testOrg.memberships.filter((m: any) => m.role === "STUDENT" && m.isActive) as any[]

        console.log(`✅ FOUND: Organization with Teacher + Students\n`)
        console.log(`📍 School: ${testOrg.name}`)
        console.log(`   School ID: ${testOrg.id}\n`)

        console.log(`✏️  Teacher:`)
        console.log(`   Teacher ID: ${teacher.userId}`)
        console.log(`   Name: ${teacher.user.firstName} ${teacher.user.lastName}`)
        console.log(`   Email: ${teacher.user.email}\n`)

        console.log(`👨‍🎓 Students (${students.length} total):`)
        students.slice(0, 3).forEach((student: any) => {
            console.log(`   ID: ${student.userId}`)
            console.log(`   Name: ${student.user.firstName} ${student.user.lastName}`)
            console.log(`   Email: ${student.user.email}`)
            console.log()
        })

        if (students.length > 3) {
            console.log(`   ... and ${students.length - 3} more students\n`)
        }

        console.log(`${"=".repeat(60)}`)
        console.log(`🎯 TO TEST FREE PAPER SYSTEM`)
        console.log(`${"=".repeat(60)}\n`)

        console.log(`Step 1: Login as Teacher`)
        console.log(`   Email: ${teacher.user.email}`)
        console.log(`   Teacher ID: ${teacher.userId}\n`)

        console.log(`Step 2: Create New Paper`)
        console.log(`   Navigate to: /teacher/new-paper\n`)

        console.log(`Step 3: Fill Paper Details`)
        console.log(`   Title: "Test Free Paper"`)
        console.log(`   Subject: Any subject`)
        console.log(`   Standard: Any standard`)
        console.log(`   Difficulty: Medium`)
        console.log(`   Duration: 60 minutes\n`)

        console.log(`Step 4: Toggle "Free Paper For Student" ON`)
        console.log(`   This sets: isFreeAccess = true\n`)

        console.log(`Step 5: Add Questions & Publish`)
        console.log(`   Backend will automatically:`)
        console.log(`   - Find ${students.length} students in ${testOrg.name}`)
        console.log(`   - Generate ${students.length} unique coupon codes`)
        console.log(`   - Send ${students.length} emails with coupons\n`)

        console.log(`Step 6: Students Will Receive Emails`)
        console.log(`   Check these email addresses:`)
        students.slice(0, 3).forEach((student: any) => {
            console.log(`   📧 ${student.user.email}`)
        })
        if (students.length > 3) {
            console.log(`   📧 ... and ${students.length - 3} more`)
        }

        console.log(`\n${"=".repeat(60)}`)
        console.log(`📋 COMPLETE SETUP INFO`)
        console.log(`${"=".repeat(60)}\n`)

        console.log(`Copy this information:`)
        console.log()
        console.log(`Organization (School)`)
        console.log(`━━━━━━━━━━━━━━━━━━━━━━`)
        console.log(`Name: ${testOrg.name}`)
        console.log(`ID: ${testOrg.id}`)
        console.log()

        console.log(`Teacher`)
        console.log(`━━━━━━━━━━━━━━━━━━━━━━`)
        console.log(`ID: ${teacher.userId}`)
        console.log(`Name: ${teacher.user.firstName} ${teacher.user.lastName}`)
        console.log(`Email: ${teacher.user.email}`)
        console.log()

        console.log(`Students (${students.length} total)`)
        console.log(`━━━━━━━━━━━━━━━━━━━━━━`)
        students.forEach((student: any, index: number) => {
            console.log(`${index + 1}. ID: ${student.userId} | ${student.user.firstName} ${student.user.lastName} | ${student.user.email}`)
        })

        console.log(`\n${"=".repeat(60)}`)
        console.log(`✅ READY TO TEST!`)
        console.log(`${"=".repeat(60)}`)
        console.log()
        console.log("1️⃣  Login as teacher: " + teacher.user.email)
        console.log("2️⃣  Create paper with 'Free Paper For Student' ON")
        console.log("3️⃣  Publish the paper")
        console.log(`4️⃣  Check emails for ${students.length} students`)
        console.log("5️⃣  Each student gets unique coupon code!")
        console.log()

        process.exit(0)
    } catch (error) {
        console.error("❌ Error:", error)
        process.exit(1)
    }
}

testFullSystem()
