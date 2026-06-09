import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// 1. เปิดชุดการเชื่อมต่อ (Connection Pool) ไปยัง PostgreSQL โดยตรง
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 2. ห่อหุ้มตัวแปรด้วย Adapter ของ Prisma v7 เพื่อแปลงภาษาส่งต่อข้อมูล
const adapter = new PrismaPg(pool);

// 3. ส่งตัวขับเคลื่อน (Adapter) เข้าไปเปิดใช้งาน Prisma Client ตัวจริง
const prisma = new PrismaClient({ adapter });

export default prisma;
