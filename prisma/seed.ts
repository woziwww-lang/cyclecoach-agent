import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth/password";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { id: "local-demo-user" },
    update: {},
    create: {
      id: "local-demo-user",
      email: "demo@cyclecoach.local",
      passwordHash: await hashPassword("password123"),
      name: "Local Demo Rider"
    }
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
