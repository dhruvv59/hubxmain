import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        const attempts = await prisma.examAttempt.groupBy({
            by: ['studentId'],
            _count: { id: true }
        });

        console.log("Attempts per student:");
        for (const group of attempts) {
            const user = await prisma.user.findUnique({ where: { id: group.studentId } });
            console.log(`Student: ${user?.firstName} ${user?.lastName} (${user?.email}) - Attempts: ${group._count.id}`);
        }

        if (attempts.length === 0) {
            console.log("No attempts found for ANY student.");
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
