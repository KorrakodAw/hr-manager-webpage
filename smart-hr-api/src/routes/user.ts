import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../lib/db";

const router = Router();

// 🆕 1. ยิง POST สำหรับสร้างพนักงานใหม่ (Create User)
// POST /api/user
router.post("/", async (req: Request, res: Response) => {
  try {
    const { email, password, name, department, role } = req.body;

    // ตรวจสอบเบื้องต้นว่าอีเมลนี้เคยลงทะเบียนไปหรือยัง
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "อีเมลนี้ถูกใช้งานในระบบแล้ว" });
    }

    // 🔐 เข้ารหัสรหัสผ่านให้ปลอดภัยก่อนบันทึกลง PostgreSQL
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        department,
        role, // ส่งมาเป็น "EMPLOYEE" | "MANAGER" | "SUPERADMIN"
      },
      // เลือกเฉพาะฟิลด์ที่ต้องการส่งกลับ (ไม่ส่ง password กลับไป)
      select: {
        id: true,
        email: true,
        name: true,
        department: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    console.error("Create User Error:", error);
    res
      .status(500)
      .json({ error: "เซิร์ฟเวอร์ขัดข้อง ไม่สามารถสร้างผู้ใช้ได้" });
  }
});

// 📋 2. ยิง GET สำหรับดึงรายชื่อพนักงานทั้งหมด (Get All Users)
// GET /api/user
router.get("/", async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      // 🚀 บรรทัดพระเอก: ล็อกคอดักกรอง ไม่เอาบัญชีที่มี Role เป็น SUPERADMIN ออกไปหน้าบ้าน
      where: {
        role: {
          not: "SUPERADMIN",
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        department: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: users });
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลรายชื่อพนักงานได้" });
  }
});

export default router;
