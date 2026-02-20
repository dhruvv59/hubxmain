import "dotenv/config"
import prisma from "../config/database"

async function checkOrg() {
    try {
        console.log("🔍 Checking Organization Setup...\n")

        // Get all organizations with members
        const orgs = await prisma.organization.findMany({
            include: {
                memberships: {
                    include: {
                        user: true,
                    },
                },
            },
        })

        console.log(`Found ${orgs.length} organizations:\n`)

        for (const org of orgs) {
            const teachers = org.memberships.filter((m: any) => m.role === "TEACHER")
            const students = org.memberships.filter((m: any) => m.role === "STUDENT")

            console.log(`📍 Organization: ${org.name}`)
            console.log(`   ID: ${org.id}`)
            console.log(`   Status: ${org.isActive ? "✅ Active" : "❌ Inactive"}`)
            console.log(`   Teachers: ${teachers.length}`)
            teachers.forEach((t: any) => {
                console.log(`     ✏️  ${t.user.firstName} ${t.user.lastName} (${t.user.email})`)
            })
            console.log(`   Students: ${students.length}`)
            students.slice(0, 5).forEach((s: any) => {
                console.log(`     👤 ${s.user.firstName} ${s.user.lastName} (${s.user.email})`)
            })
            if (students.length > 5) {
                console.log(`     ... and ${students.length - 5} more students`)
            }
            console.log()
        }

        console.log("═════════════════════════════════════════════")
        console.log("KEY POINT FOR FREE PAPER SYSTEM:")
        console.log("═════════════════════════════════════════════")
        console.log("")
        console.log("When teacher publishes paper with 'Free Paper For Student':")
        console.log("")
        for (const org of orgs) {
            const students = org.memberships.filter((m: any) => m.role === "STUDENT")
            console.log(`📧 Organization: ${org.name}`)
            console.log(`   Email sent to: ${students.length} students`)
            console.log(`   Each student gets: 1 unique coupon code`)
            console.log("")
        }

        process.exit(0)
    } catch (error) {
        console.error("Error:", error)
        process.exit(1)
    }
}

checkOrg()
