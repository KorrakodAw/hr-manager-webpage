import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "ts-node prisma/seed.ts", // 📦 ย้ายคำสั่งรันสคริปต์ยัดข้อมูลมาคุมที่จุดนี้
  },
  datasource: {
    url: env("DATABASE_URL"), // ดึงค่า URL เชื่อมต่อส่งต่อให้ CLI ทำงาน
  },
});
