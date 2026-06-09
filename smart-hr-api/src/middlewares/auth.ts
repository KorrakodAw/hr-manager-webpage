import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_smarthr_key";

// ขยายสิทธิ์ของ Express Request ให้จำข้อมูล user ที่แกะมาจาก Token ได้
export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // ดึง TOKEN ออกมาจากคำว่า "Bearer <TOKEN>"

  if (!token) {
    return res
      .status(401)
      .json({ error: "ปฏิเสธการเข้าถึง: ไม่พบรหัสยืนยันตัวตน (Token)" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded; // ยัดข้อมูลคนล็อกอินลง req.user เพื่อให้โค้ดส่วนถัดไปดึงไปใช้งานได้
    next();
  } catch (error) {
    return res
      .status(403)
      .json({ error: "รหัสยืนยันตัวตนหมดอายุหรือไม่ถูกต้อง" });
  }
};
