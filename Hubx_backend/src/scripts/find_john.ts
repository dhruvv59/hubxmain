import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        const user = await prisma.user.findFirst({
            where: {
                firstName: { contains: "John" }
            }
        });

        console.log("Found User:", user);

        if (user) {
            const attempts = await prisma.examAttempt.findMany({
                where: { studentId: user.id }
            });
            console.log("Attempts Count:", attempts.length);
            console.log("Attempts:", attempts);
        } else {
            console.log("User John not found via firstName.");
        }

        // Check if any other users exist
        const allUsers = await prisma.user.findMany({ select: { firstName: true, email: true, role: true } });
        console.log("All Users:", allUsers);

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
