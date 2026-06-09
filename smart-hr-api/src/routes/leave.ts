import { Router, Request, Response } from "express";
import prisma from "../lib/db";

const router = Router();

// 📥 1. ยื่นใบลาใหม่ (POST /api/leave)
router.post("/", async (req: Request, res: Response) => {
  try {
    const { leaveType, startDate, endDate, reason, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "ไม่พบรหัสผู้ใช้งาน (userId)" });
    }

    const leave = await prisma.leaveRequest.create({
      data: {
        userId,
        leaveType,
        reason,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    res.status(201).json({ success: true, data: leave });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "เซิร์ฟเวอร์ขัดข้อง ไม่สามารถยื่นใบลาได้" });
  }
});

// 📋 2. ดึงข้อมูลใบลาแบบ Hybrid (GET /api/leave)
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;

    // 🔹 เคส A: ถ้าส่ง ?userId=... มา -> ดึงเฉพาะประวัติของพนักงานคนนั้น (สำหรับ LeaveForm)
    if (userId) {
      const leaves = await prisma.leaveRequest.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      return res.json({ success: true, data: leaves });
    }

    // 🔹 เคส B: ถ้าไม่ได้ส่ง userId มา -> ดึงคำขอของทุกคนพร้อมข้อมูลพนักงาน (สำหรับ ManagerDashboard)
    const allRequests = await prisma.leaveRequest.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" }, // ใบลาใหม่ล่าสุดขึ้นก่อน
    });

    res.json({ success: true, data: allRequests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลใบลาได้" });
  }
});

// ✍️ 3. อัปเดตสถานะการอนุมัติใบลา (PATCH /api/leave/:id)
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // รับค่า "APPROVED" หรือ "REJECTED"

    if (status !== "APPROVED" && status !== "REJECTED") {
      return res.status(400).json({ error: "สถานะการพิจารณาไม่ถูกต้อง" });
    }

    const updatedLeave = await prisma.leaveRequest.update({
      where: { id },
      data: { status },
    });

    res.json({ success: true, data: updatedLeave });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "ไม่สามารถอัปเดตสถานะใบลาได้" });
  }
});

export default router;
