import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { firstName: { contains: 'John' } },
                    { lastName: { contains: 'Doe' } }
                ]
            }
        });

        console.log("Users found searching for John/Doe:", users);
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
