import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, Role, UserStatus, RecordType } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  await prisma.financeRecord.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const analystPassword = await bcrypt.hash("Analyst123!", 10);
  const viewerPassword = await bcrypt.hash("Viewer123!", 10);

  const [admin, analyst, viewer] = await Promise.all([
    prisma.user.create({
      data: {
        name: "System Admin",
        email: "admin@example.com",
        passwordHash: adminPassword,
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
      },
    }),
    prisma.user.create({
      data: {
        name: "Finance Analyst",
        email: "analyst@example.com",
        passwordHash: analystPassword,
        role: Role.ANALYST,
        status: UserStatus.ACTIVE,
      },
    }),
    prisma.user.create({
      data: {
        name: "Dashboard Viewer",
        email: "viewer@example.com",
        passwordHash: viewerPassword,
        role: Role.VIEWER,
        status: UserStatus.ACTIVE,
      },
    }),
  ]);

  await prisma.financeRecord.createMany({
    data: [
      {
        amount: 5000,
        type: RecordType.INCOME,
        category: "Salary",
        date: new Date("2026-01-05"),
        notes: "Monthly salary",
        createdById: admin.id,
      },
      {
        amount: 1200,
        type: RecordType.EXPENSE,
        category: "Rent",
        date: new Date("2026-01-08"),
        notes: "Apartment rent",
        createdById: admin.id,
      },
      {
        amount: 320,
        type: RecordType.EXPENSE,
        category: "Groceries",
        date: new Date("2026-01-10"),
        notes: "Weekly groceries",
        createdById: analyst.id,
      },
      {
        amount: 750,
        type: RecordType.INCOME,
        category: "Freelance",
        date: new Date("2026-02-11"),
        notes: "Design contract",
        createdById: analyst.id,
      },
      {
        amount: 140,
        type: RecordType.EXPENSE,
        category: "Transport",
        date: new Date("2026-02-13"),
        notes: "Fuel and toll",
        createdById: viewer.id,
      },
    ],
  });

  console.log("Seed data inserted.");
  console.log("Admin login: admin@example.com / Admin123!");
  console.log("Analyst login: analyst@example.com / Analyst123!");
  console.log("Viewer login: viewer@example.com / Viewer123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
