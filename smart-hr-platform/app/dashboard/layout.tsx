"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);

  // src/app/app/dashboard/layout.tsx

  useEffect(() => {
    // 🕵️‍♂️ ดึงข้อมูลเซสชันจากเครื่องพนักงาน
    const session = localStorage.getItem("user_session");

    if (!session) {
      router.push("/login"); // เด้งไปหน้าล็อกอินถ้ายังไม่ได้ล็อกอิน
    } else {
      // 🚀 วิธีแก้: ห่อด้วย setTimeout เพื่อหลบการรันแบบ Synchronous ตัวแดงจะหายทันทีครับ
      setTimeout(() => {
        setUser(JSON.parse(session));
      }, 0);
    }
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("user_session");
    router.push("/login");
  }

  if (!user)
    return (
      <div className="text-center py-20 text-gray-500">
        กำลังตรวจสอบสิทธิ์การเข้าถึง...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8 items-center">
              <div className="flex-shrink-0 flex items-center">
                <Link
                  href="/"
                  className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
                >
                  SmartHR 🚀
                </Link>
              </div>

              {/* ตรงส่วนลิงก์เมนูสลับหน้าต่างใน src/app/dashboard/layout.tsx */}
              <div className="hidden sm:flex sm:space-x-4 h-full">
                {/* 🙋‍♂️ ปุ่มพนักงาน: เปิดให้ทั้ง EMPLOYEE และ SUPERADMIN มองเห็น */}
                {(user.role === "EMPLOYEE" || user.role === "SUPERADMIN") && (
                  <Link
                    href="/dashboard/leave"
                    className={`inline-flex items-center px-3 h-full border-b-2 text-sm font-medium ${
                      pathname === "/dashboard/leave"
                        ? "border-blue-600 text-blue-600 font-bold"
                        : "border-transparent text-gray-500"
                    }`}
                  >
                    🙋‍♂️ ฝั่งพนักงาน (ยื่นใบลา)
                  </Link>
                )}

                {/* 👔 ปุ่มหัวหน้างาน: เปิดให้ทั้ง MANAGER และ SUPERADMIN มองเห็น */}
                {(user.role === "MANAGER" || user.role === "SUPERADMIN") && (
                  <Link
                    href="/dashboard/manager"
                    className={`inline-flex items-center px-3 h-full border-b-2 text-sm font-medium ${
                      pathname === "/dashboard/manager"
                        ? "border-indigo-600 text-indigo-600 font-bold"
                        : "border-transparent text-gray-500"
                    }`}
                  >
                    👔 ฝั่งหัวหน้า / HR (อนุมัติ)
                  </Link>
                )}

                {user.role === "SUPERADMIN" && (
                  <Link
                    href="/dashboard/users"
                    className={`inline-flex items-center px-3 h-full border-b-2 text-sm font-medium transition-colors ${
                      pathname === "/dashboard/users"
                        ? "border-purple-600 text-purple-600 font-bold"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    ⚡ จัดการผู้ใช้งานระบบ
                  </Link>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-gray-700">
                  {user.name}
                </p>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">
                  {user.role}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-red-500 hover:text-red-700 border border-red-200 hover:bg-red-50 py-1.5 px-3 rounded-lg transition-colors"
              >
                ออกจากระบบ 🚪
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
