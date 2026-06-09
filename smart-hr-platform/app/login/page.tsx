"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // 👈 1. เพิ่มการอินพอร์ต Link สำหรับเปลี่ยนหน้า
import { Eye, EyeOff, ArrowLeft } from "lucide-react"; // 👈 2. เพิ่มไอคอน ArrowLeft

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "เข้าสู่ระบบล้มเหลว");
      }

      localStorage.setItem("user_session", JSON.stringify(result.user));

      if (result.user.role === "MANAGER") {
        router.push("/dashboard/manager");
      } else {
        router.push("/dashboard/leave");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto w-full max-w-md px-4 sm:px-0">
        {/* 🔙 3. เพิ่มปุ่มย้อนกลับไปหน้าแรก (Landing Page) พร้อมเอฟเฟกต์ขยับเมื่อชี้ */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors mb-5 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          กลับสู่หน้าหลัก
        </Link>

        <h2 className="text-3xl font-black text-gray-950 tracking-tight text-center">
          🚀 SmartHR Portal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          เข้าสู่ระบบเพื่อจัดการและยื่นใบลาอิเล็กทรอนิกส์
        </p>
      </div>

      <div className="mt-8 sm:mx-auto w-full max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-200/60">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                อีเมลพนักงาน
              </label>
              <input
                type="email"
                name="email"
                placeholder="somchai@company.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              />
              <p className="text-[10px] text-gray-400 mt-1">
                *ใส่คำว่า manager ในอีเมลเพื่อทดสอบเป็นสิทธิ์หัวหน้างาน
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                รหัสผ่าน
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                  title={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-200 font-medium">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>

          <div className="mt-6 p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-500 space-y-1">
            <p className="font-bold text-gray-700">
              🔑 บัญชีสำหรับทดสอบ (รหัสผ่านคือ password123):
            </p>
            <p>• พนักงาน: employee@company.com</p>
            <p>• หัวหน้างาน: manager@company.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
