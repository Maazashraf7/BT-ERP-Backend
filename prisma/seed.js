// import pkg from "@prisma/client";
// import bcrypt from "bcryptjs";

// const { PrismaClient } = pkg;
// const prisma = new PrismaClient();

// async function main() {
//   console.log("🌱 Seeding started...");

//   // -----------------------------
//   // 1. MODULES (ERP FEATURES)
//   // -----------------------------
//   const modules = [
//     { key: "students", name: "Students Management" },
//     { key: "attendance", name: "Attendance" },
//     { key: "fees", name: "Fees Management" },
//     { key: "exams", name: "Examinations" },
//     { key: "library", name: "Library" },
//   ];

//   for (const module of modules) {
//     await prisma.module.upsert({
//       where: { key: module.key },
//       update: {},
//       create: module,
//     });
//   }

//   console.log("✅ Modules seeded");

//   // -----------------------------
//   // 2. PERMISSIONS (RBAC)
//   // -----------------------------
//   const permissions = [
//     // Students
//     "student.create",
//     "student.view",
//     "student.update",
//     "student.delete",

//     // Attendance
//     "attendance.mark",
//     "attendance.view",

//     // Fees
//     "fees.create",
//     "fees.collect",
//     "fees.view",

//     // Exams
//     "exam.create",
//     "exam.view",

//     // Platform
//     "tenant.create",
//     "tenant.view",
//   ];

//   for (const key of permissions) {
//     await prisma.permission.upsert({
//       where: { key },
//       update: {},
//       create: { key },
//     });
//   }

//   console.log("✅ Permissions seeded");

// // -----------------------------
// // 3. SUPER ADMIN (PLATFORM)
// // -----------------------------
// const superAdminEmail = "superadmin@bterp.com";
// const superAdminPassword = "SuperAdmin@123";

// const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

// // Check if Super Admin already exists
// const existingSuperAdmin = await prisma.user.findFirst({
//   where: {
//     email: superAdminEmail,
//     tenantId: null,
//   },
// });

// if (!existingSuperAdmin) {
//   await prisma.user.create({
//     data: {
//       email: superAdminEmail,
//       password: hashedPassword,
//       tenantId: null,
//       roleId: null,
//     },
//   });

//   console.log("✅ Super Admin created");
// } else {
//   console.log("ℹ️ Super Admin already exists");
// }

// console.log("📧 Email:", superAdminEmail);
// console.log("🔑 Password:", superAdminPassword);
//   console.log("✅ Super Admin created");
//   console.log("📧 Email:", superAdminEmail);
//   console.log("🔑 Password:", superAdminPassword);

//   console.log("🌱 Seeding completed successfully");
// }

// main()
//   .catch((e) => {
//     console.error("❌ Seeding failed", e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
import prisma from "../src/core/config/db.js";

async function main() {
  console.log("🌱 Seeding plans...");

  // TRIAL PLAN
  const trialPlan = await prisma.plan.upsert({
    where: { name: "TRIAL" },
    update: {},
    create: {
      name: "TRIAL",
      price: 0,
      duration: 14, // 14 days trial
      isActive: true,
    },
  });

  console.log("✅ TRIAL plan ready:", trialPlan.name);
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
