"use client";

import { useState, useEffect, FormEvent } from "react";
import {
  UserPlus,
  Users,
  Shield,
  Briefcase,
  Phone,
  Mail,
  Eye,
  EyeOff,
} from "lucide-react";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "EMPLOYEE" | "MANAGER";
  department: string;
  phone: string;
  password: string; // เพิ่มฟิลด์นี้เพื่อแสดงว่ามีรหัสผ่านหรือไม่
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [visiblePasswordIds, setVisiblePasswordIds] = useState<
    Record<string, boolean>
  >({});
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswordIds((prev) => ({
      ...prev,
      [id]: !prev[id], // พลิกค่าเฉพาะคีย์ของ ID นั้นๆ
    }));
  };

  // 🛡️ ตรวจสอบสิทธิ์ว่าใช่ Superadmin จริงไหมก่อนยอมให้เห็นเนื้อหาหน้าเว็บ
  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (session) {
      const parsed = JSON.parse(session);
      if (parsed.role === "SUPERADMIN") {
        setTimeout(() => setIsSuperAdmin(true), 0);
      }
    }
  }, []);

  // 🔄 ดึงรายชื่อผู้ใช้ทั้งหมดจาก API
  useEffect(() => {
    if (!isSuperAdmin) return;

    let isMounted = true;
    async function fetchUsers() {
      try {
        setLoading(true);
        const response = await fetch(`${apiUrl}/users`);
        const result = await response.json();
        if (result.success && isMounted) {
          setUsers(result.data);
        }
      } catch (err) {
        console.error("โหลดรายชื่อผู้ใช้ล้มเหลว:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchUsers();
    return () => {
      isMounted = false;
    };
  }, [refreshKey, apiUrl, isSuperAdmin]);

  // 📝 ส่งฟอร์มสร้างผู้ใช้ใหม่
  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setFormLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(formElement);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`${apiUrl}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "ไม่สามารถสร้างผู้ใช้ได้");

      setSuccess(true);
      formElement.reset();
      setRefreshKey((prev) => prev + 1); // รีเฟรชตารางด้านข้างทันที
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  }

  if (!isSuperAdmin) {
    return (
      <div className="text-center py-20 text-red-500 font-bold">
        ⚠️ ขออภัย สิทธิ์การเข้าถึงหน้านี้เฉพาะ SUPERADMIN เท่านั้น
      </div>
    );
  }

  if (loading && users.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500 font-medium">
        กำลังโหลดโครงสร้างบัญชีผู้ใช้งานระบบ...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="w-7 h-7 text-blue-600" />{" "}
          จัดการพนักงานและสิทธิ์ผู้ใช้งาน
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          เพิ่มพนักงานใหม่ บันทึกข้อมูลส่วนตัว และกำหนดบทบาทการเข้าถึงระบบ
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* ➕ ฝั่งซ้าย: ฟอร์มลงทะเบียนพนักงานใหม่ */}
        <div className="lg:col-span-2 p-6 bg-white rounded-xl shadow-md border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-green-500" /> ลงทะเบียนพนักงานใหม่
          </h2>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                ชื่อ-นามสกุล
              </label>
              <input
                type="text"
                name="name"
                placeholder="เช่น สมชาย ใจดี"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                อีเมลระบบ (Email)
              </label>
              <input
                type="email"
                name="email"
                placeholder="employee@company.com"
                // 🎯 ใช้ Regex ตรวจสอบโครงสร้างอีเมลสากล (ต้องมี @ และตามด้วยชื่อโดเมน .com/.co.th ฯลฯ ให้ถูกต้อง)
                pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                // 💡 หากต้องการล็อกให้สมัครได้เฉพาะอีเมลองค์กรเท่านั้น สามารถใช้ pattern ด้านล่างนี้แทนได้ครับ:
                // pattern="^[a-zA-Z0-9._%+-]+@company\.com$"
                title="กรุณากรอกอีเมลให้ถูกต้องตามรูปแบบโครงสร้างระบบ (เช่น employee@company.com)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                รหัสผ่านตั้งต้น
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  แผนก / ฝ่าย
                </label>
                <input
                  type="text"
                  name="department"
                  placeholder="เช่น Marketing"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="text"
                  name="phone"
                  placeholder="0812345678" // 👈 เปลี่ยนรูปแบบตัวอย่างให้เป็น 10 หลักไม่มีขีด
                  maxLength={10} // 🛑 บล็อกไม่ให้ผู้ใช้งานพิมพ์ตัวอักษรเกิน 10 ตัว
                  pattern="^0[0-9]{9}$" // 🎯 กฎเหล็ก: ต้องขึ้นต้นด้วยเลข 0 และตามด้วยตัวเลขอีก 9 ตัวจนครบ 10 หลักเท่านั้น
                  inputMode="numeric" // 📱 ถ้าเปิดผ่านมือถือ แป้นพิมพ์จะเปลี่ยนเป็นคีย์บอร์ดตัวเลขให้โดยอัตโนมัติ
                  title="กรุณากรอกเบอร์โทรศัพท์เป็นตัวเลข 10 หลักเท่านั้น (เช่น 0812345678)" // 💡 ข้อความแจ้งเตือนเมื่อพิมพ์ไม่ครบหรือใส่สัญลักษณ์แปลกปลอม
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                สิทธิ์การใช้งาน (Role)
              </label>
              <select
                name="role"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white"
                required
              >
                <option value="EMPLOYEE">🙋‍♂️ EMPLOYEE (พนักงาน - ยื่นลา)</option>
                <option value="MANAGER">
                  👔 MANAGER (หัวหน้า/HR - อนุมัติใบลา)
                </option>
              </select>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-200 font-medium">
                ⚠️ {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-50 text-green-600 text-xs rounded-lg border border-green-200 font-medium">
                🎉 ลงทะเบียนพนักงานสำเร็จ!
              </div>
            )}

            <button
              type="submit"
              disabled={formLoading}
              className={`w-full py-2 px-4 text-white text-sm font-semibold rounded-lg transition-colors ${formLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {formLoading ? "กำลังบันทึกข้อมูล..." : "บันทึกรายชื่อพนักงาน"}
            </button>
          </form>
        </div>

        {/* 📋 ฝั่งขวา: ตารางรายชื่อผู้ใช้งานทั้งหมด */}
        <div className="lg:col-span-3 p-6 bg-white rounded-xl shadow-md border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-500" />{" "}
            บัญชีผู้ใช้ในระบบปัจจุบัน ({users.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-600 text-xs font-bold uppercase border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">ข้อมูลพนักงาน</th>
                  <th className="px-4 py-3">แผนก / เบอร์โทร</th>
                  <th className="px-4 py-3 text-center">สิทธิ์</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100 text-gray-700">
                {users.map((u) => {
                  // 🕵️ Check ว่าพนักงาน ID นี้กำลังโดนสั่งเปิดตาอยู่หรือไม่
                  const isPasswordVisible = !!visiblePasswordIds[u.id];

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      {/* คอลัมน์ข้อมูลพนักงานเดิม... */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">
                          {u.name}
                        </div>
                        <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" /> {u.email}
                        </div>
                      </td>

                      {/* คอลัมน์แผนกเดิม... */}
                      <td className="px-4 py-3 text-xs">
                        <div className="text-gray-700 font-medium flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-gray-400" />{" "}
                          {u.department}
                        </div>
                        <div className="text-gray-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" /> {u.phone}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                            u.role === "MANAGER"
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      {/* 🔐 🔑 คอลัมน์รหัสผ่านใหม่: ซ่อน/แสดง แยกตาม ID อย่างอิสระ */}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
