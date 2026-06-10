import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import leaveRoutes from "./routes/leave";
import userRoutes from "./routes/user";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 🛡️ ปลดล็อก CORS ด่านหน้าประตูแบบ Global จุดเดียวจบการกวนใจ
app.use(
  cors({
    origin: ["http://localhost:3000", "https://hr-manager-webpage.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  }),
);

app.use(express.json());

// ผูกเส้นทาง API
app.use("/api/auth", authRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Dedicated Backend is walking on http://localhost:${PORT}`);
});
