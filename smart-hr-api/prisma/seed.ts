// smart-hr-api/prisma/seed.ts

import bcrypt from "bcryptjs";
// 🚀 บรรทัดพระเอก: เปลี่ยนมาอิมพอร์ต prisma ตัวหลักที่เซ็ตระบบ v7 เสร็จสรรพแล้วมาใช้แทน
import prisma from "../src/lib/db";

async function main() {
  // 🧹 ล้างข้อมูลเก่าในตารางออกก่อนเพื่อความสะอาด
  await prisma.user.deleteMany();

  // เข้ารหัสพาสเวิร์ดมาตรฐานสำหรับใช้เทส: "password123"
  const hashedPassword = await bcrypt.hash("password123", 10);
  const hashedAdminPassword = await bcrypt.hash("admin123", 10);

  // 1. เสกบัญชีระดับหัวหน้างาน (MANAGER)
  await prisma.user.create({
    data: {
      email: "manager@company.com",
      password: hashedPassword,
      name: "หัวหน้า สมศักดิ์",
      department: "HR",
      role: "MANAGER",
    },
  });

  // 2. เสกบัญชีระดับพนักงานทั่วไป (EMPLOYEE)
  await prisma.user.create({
    data: {
      email: "employee@company.com",
      password: hashedPassword,
      name: "พนักงาน สมชาย",
      department: "IT",
      role: "EMPLOYEE",
    },
  });

  await prisma.user.create({
    data: {
      email: "admin@company.com",
      password: hashedAdminPassword,
      name: "แอดมิน สมบูรณ์",
      department: "Admin",
      role: "SUPERADMIN",
    }
  })

  console.log("🌱 [SmartHR] Database seeded successfully with test accounts!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
