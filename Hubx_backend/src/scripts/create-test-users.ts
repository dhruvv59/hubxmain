import "dotenv/config"
import prisma from "../config/database"
import bcrypt from "bcryptjs"

async function createTestUsers() {
    try {
        console.log("🚀 Creating Test Users...\n")
        console.log("═══════════════════════════════════════════════════════")
        console.log("TEST USER CREATION")
        console.log("═══════════════════════════════════════════════════════\n")

        // Step 1: Create or get organization
        console.log("📍 Step 1: Create/Get Organization")
        let organization = await prisma.organization.findFirst({
            where: { name: "Dhruv Test School" },
        })

        if (!organization) {
            organization = await prisma.organization.create({
                data: {
                    name: "Dhruv Test School",
                    type: "SCHOOL",
                    code: "DHRUV-TEST-001",
                    description: "Test school for Free Paper System",
                    isActive: true,
                },
            })
            console.log("   ✅ Created: Dhruv Test School")
        } else {
            console.log("   ✅ Found: Dhruv Test School")
        }
        console.log(`   Organization ID: ${organization.id}\n`)

        // Step 2: Create Teacher User
        console.log("👨‍🏫 Step 2: Create Teacher User")
        const hashedPassword = await bcrypt.hash("teacher@123", 10)

        let teacherUser = await prisma.user.findUnique({
            where: { email: "test.teacher@hubx.in" },
        })

        if (!teacherUser) {
            teacherUser = await prisma.user.create({
                data: {
                    email: "test.teacher@hubx.in",
                    password: hashedPassword,
                    firstName: "Test",
                    lastName: "Teacher",
                    role: "TEACHER",
                    avatar: null,
                    streak: 0,
                },
            })
            console.log("   ✅ Created Teacher User")
        } else {
            console.log("   ✅ Found Teacher User")
        }
        console.log(`   Email: test.teacher@hubx.in`)
        console.log(`   Password: teacher@123`)
        console.log(`   User ID: ${teacherUser.id}\n`)

        // Step 3: Add Teacher to Organization
        console.log("📋 Step 3: Add Teacher to Organization")
        let teacherMembership = await prisma.organizationMember.findFirst({
            where: {
                userId: teacherUser.id,
                organizationId: organization.id,
            },
        })

        if (!teacherMembership) {
            teacherMembership = await prisma.organizationMember.create({
                data: {
                    userId: teacherUser.id,
                    organizationId: organization.id,
                    role: "TEACHER",
                    isActive: true,
                },
            })
            console.log("   ✅ Teacher added to organization")
        } else {
            console.log("   ✅ Teacher already in organization")
        }
        console.log(`   Membership ID: ${teacherMembership.id}\n`)

        // Step 4: Create Student User with ahirdhruv5050@gmail.com
        console.log("👨‍🎓 Step 4: Create Student User")
        const studentPassword = await bcrypt.hash("student@123", 10)

        let studentUser = await prisma.user.findUnique({
            where: { email: "ahirdhruv5050@gmail.com" },
        })

        if (!studentUser) {
            studentUser = await prisma.user.create({
                data: {
                    email: "ahirdhruv5050@gmail.com",
                    password: studentPassword,
                    firstName: "Dhruv",
                    lastName: "Ahir",
                    role: "STUDENT",
                    avatar: null,
                    streak: 0,
                },
            })
            console.log("   ✅ Created Student User")
        } else {
            console.log("   ✅ Found Student User")
        }
        console.log(`   Email: ahirdhruv5050@gmail.com`)
        console.log(`   Password: student@123`)
        console.log(`   User ID: ${studentUser.id}\n`)

        // Step 5: Add Student to Same Organization
        console.log("📋 Step 5: Add Student to Same Organization")
        let studentMembership = await prisma.organizationMember.findFirst({
            where: {
                userId: studentUser.id,
                organizationId: organization.id,
            },
        })

        if (!studentMembership) {
            studentMembership = await prisma.organizationMember.create({
                data: {
                    userId: studentUser.id,
                    organizationId: organization.id,
                    role: "STUDENT",
                    isActive: true,
                },
            })
            console.log("   ✅ Student added to organization")
        } else {
            console.log("   ✅ Student already in organization")
        }
        console.log(`   Membership ID: ${studentMembership.id}\n`)

        // Summary
        console.log("═══════════════════════════════════════════════════════")
        console.log("✅ TEST USERS CREATED SUCCESSFULLY!")
        console.log("═══════════════════════════════════════════════════════\n")

        console.log("📍 ORGANIZATION")
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        console.log(`Name: ${organization.name}`)
        console.log(`ID: ${organization.id}`)
        console.log(`Status: ✅ Active\n`)

        console.log("👨‍🏫 TEACHER")
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        console.log(`Name: ${teacherUser.firstName} ${teacherUser.lastName}`)
        console.log(`Email: ${teacherUser.email}`)
        console.log(`Password: teacher@123`)
        console.log(`User ID: ${teacherUser.id}`)
        console.log(`Organization ID: ${organization.id}\n`)

        console.log("👨‍🎓 STUDENT")
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        console.log(`Name: ${studentUser.firstName} ${studentUser.lastName}`)
        console.log(`Email: ${studentUser.email}`)
        console.log(`Password: student@123`)
        console.log(`User ID: ${studentUser.id}`)
        console.log(`Organization ID: ${organization.id}\n`)

        console.log("═══════════════════════════════════════════════════════")
        console.log("🎯 HOW TO TEST FREE PAPER SYSTEM")
        console.log("═══════════════════════════════════════════════════════\n")

        console.log("1️⃣  LOGIN AS TEACHER")
        console.log(`   URL: http://localhost:3000/login`)
        console.log(`   Email: ${teacherUser.email}`)
        console.log(`   Password: teacher@123\n`)

        console.log("2️⃣  CREATE NEW PAPER")
        console.log(`   Navigate to: /teacher/new-paper`)
        console.log(`   Fill in paper details (Title, Subject, Standard, etc.)\n`)

        console.log("3️⃣  TOGGLE 'FREE PAPER FOR STUDENT' ON")
        console.log(`   Enable the toggle (sets isFreeAccess = true)\n`)

        console.log("4️⃣  PUBLISH THE PAPER")
        console.log(`   Click 'Publish' button\n`)

        console.log("5️⃣  BACKEND AUTOMATICALLY SENDS EMAIL")
        console.log(`   To: ${studentUser.email}`)
        console.log(`   Contains: Unique coupon code`)
        console.log(`   From: support@lernen-hub.com\n`)

        console.log("6️⃣  CHECK EMAIL INBOX")
        console.log(`   Email: ${studentUser.email}`)
        console.log(`   Look for subject starting with "🎓 New Exam Available"\n`)

        console.log("7️⃣  LOGIN AS STUDENT & REDEEM COUPON")
        console.log(`   Email: ${studentUser.email}`)
        console.log(`   Password: student@123`)
        console.log(`   Enter coupon code from email`)
        console.log(`   Get free access! ✅\n`)

        console.log("═══════════════════════════════════════════════════════")
        console.log("📋 COPY THIS INFO FOR REFERENCE")
        console.log("═══════════════════════════════════════════════════════\n")

        console.log("Teacher Login:")
        console.log(`Email: test.teacher@hubx.in`)
        console.log(`Password: teacher@123\n`)

        console.log("Student Email (to receive coupons):")
        console.log(`Email: ahirdhruv5050@gmail.com`)
        console.log(`Password: student@123\n`)

        console.log("Organization ID (for backend queries):")
        console.log(`${organization.id}\n`)

        process.exit(0)
    } catch (error) {
        console.error("❌ Error:", error)
        process.exit(1)
    }
}

createTestUsers()
