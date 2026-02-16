import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true
            }
        });

        console.log("Registered Users:");
        users.forEach(u => {
            console.log(`- ${u.email} (${u.firstName} ${u.lastName}) -> ROLE: ${u.role}`);
        });

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
