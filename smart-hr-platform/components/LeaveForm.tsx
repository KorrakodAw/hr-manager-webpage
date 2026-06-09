"use client";

import { useState, useEffect, FormEvent } from "react";

interface LeaveHistoryItem {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export default function LeaveForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [history, setHistory] = useState<LeaveHistoryItem[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // 🆔 1. สร้าง State มารองรับไอดีจริงแทนการม็อกตัวเลขเดิมค้างไว้
  const [userId, setUserId] = useState<string>("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (session) {
      const parsedUser = JSON.parse(session);

      // 🚀 วิธีแก้: ห่อด้วย setTimeout ดีเลย์เสี้ยววินาทีเพื่อเคลียร์ตัวแดง Cascading Renders ครับ
      setTimeout(() => {
        setUserId(parsedUser.id);
      }, 0);
    }
  }, []);

  // 📊 3. ฟังก์ชันช่วยคำนวณวันลา
  function calculateDays(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const differenceInTime = endDate.getTime() - startDate.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);
    return Math.max(1, differenceInDays + 1);
  }

  // คำนวณวันลาแยกประเภท (นับเฉพาะคำขอที่ APPROVED แล้ว)
  const usedSickDays = history
    .filter((item) => item.leaveType === "SICK" && item.status === "APPROVED")
    .reduce(
      (sum, item) => sum + calculateDays(item.startDate, item.endDate),
      0,
    );

  const usedAnnualDays = history
    .filter((item) => item.leaveType === "ANNUAL" && item.status === "APPROVED")
    .reduce(
      (sum, item) => sum + calculateDays(item.startDate, item.endDate),
      0,
    );

  const usedPersonalDays = history
    .filter(
      (item) => item.leaveType === "PERSONAL" && item.status === "APPROVED",
    )
    .reduce(
      (sum, item) => sum + calculateDays(item.startDate, item.endDate),
      0,
    );

  const SICK_QUOTA = 30;
  const ANNUAL_QUOTA = 10;
  const PERSONAL_QUOTA = 6;

  // 🧠 4. ซิงโครไนซ์ประวัติการลา (จะวิ่งไปดึงข้อมูลเมื่อได้รหัส userId มาแล้วเท่านั้น)
  useEffect(() => {
    if (!userId) return; // 🛑 ป้องกันไม่ให้หลังบ้านฟ้อง Error กรณีไอดีว่างช่วงมิลลิวินาทีแรกที่วาดหน้าจอ

    let isMounted = true;
    async function fetchMyHistory() {
      try {
        const response = await fetch(`${apiUrl}/leave?userId=${userId}`); // 🚀 ส่งไอดีจริงไปฟิลเตอร์ข้อมูล
        const result = await response.json();
        if (result.success && isMounted) {
          setHistory(result.data);
        }
      } catch (err) {
        console.error("โหลดประวัติการลาไม่สำเร็จ:", err);
      }
    }
    fetchMyHistory();
    return () => {
      isMounted = false;
    };
  }, [refreshKey, apiUrl, userId]); // 👈 ผูกสัมพันธ์ไว้กับไอดีจริง

  // 📝 5. ฟังก์ชันตอนส่งฟอร์มใบลา
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;

    if (!userId) {
      setError("ไม่พบข้อมูลผู้ใช้งาน กรุณาล็อกอินใหม่อีกครั้ง");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(formElement);
    const leaveType = formData.get("leaveType") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const reason = formData.get("reason") as string;

    // ระบบตรวจเช็กโควตาวันลาคงเหลือ
    const requestingDays = calculateDays(startDate, endDate);
    if (leaveType === "SICK" && usedSickDays + requestingDays > SICK_QUOTA) {
      setError(
        `ไม่สามารถยื่นลาได้ เนื่องจากคุณเหลือโควตาลาป่วยอีกแค่ ${SICK_QUOTA - usedSickDays} วัน`,
      );
      setLoading(false);
      return;
    }
    if (
      leaveType === "ANNUAL" &&
      usedAnnualDays + requestingDays > ANNUAL_QUOTA
    ) {
      setError(
        `ไม่สามารถยื่นลาได้ เนื่องจากคุณเหลือโควตาลาพักร้อนอีกแค่ ${ANNUAL_QUOTA - usedAnnualDays} วัน`,
      );
      setLoading(false);
      return;
    }
    if (
      leaveType === "PERSONAL" &&
      usedPersonalDays + requestingDays > PERSONAL_QUOTA
    ) {
      setError(
        `ไม่สามารถยื่นลาได้ เนื่องจากคุณเหลือโควตาลากิจอีกแค่ ${PERSONAL_QUOTA - usedPersonalDays} วัน`,
      );
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 🚀 ไฮไลต์เด็ด: ยิงค่าผูกมัดรหัสไอดีพนักงานคนนี้พ่วงส่งไปใน Body เพื่อเซฟลงตารางหลังบ้าน
        body: JSON.stringify({ leaveType, startDate, endDate, reason, userId }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "เกิดข้อผิดพลาด");

      setSuccess(true);
      formElement.reset(); // เคลียร์ฟอร์มช่องกรอกอย่างปลอดภัย
      setRefreshKey((prev) => prev + 1); // สะกิดโหลดประวัติตารางด้านล่างใหม่ทันที
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ป้องกันหน้าต่างกะพริบระหว่างโหลดไอดี
  if (!userId)
    return (
      <div className="text-center py-12 text-gray-500">
        กำลังเชื่อมต่อข้อมูลโปรไฟล์ประจำตัวของคุณ...
      </div>
    );

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* 📊 กล่องสรุปการลาคงเหลือ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-400">
              🤒 สิทธิ์ลาป่วยคงเหลือ
            </p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {SICK_QUOTA - usedSickDays}{" "}
              <span className="text-sm font-normal text-gray-500">
                / {SICK_QUOTA} วัน
              </span>
            </h3>
          </div>
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-lg flex items-center justify-center text-xl font-bold">
            {usedSickDays}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-400">
              🏖️ สิทธิ์ลาพักร้อนคงเหลือ
            </p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {ANNUAL_QUOTA - usedAnnualDays}{" "}
              <span className="text-sm font-normal text-gray-500">
                / {ANNUAL_QUOTA} วัน
              </span>
            </h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center text-xl font-bold">
            {usedAnnualDays}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-400">
              💼 สิทธิ์ลากิจคงเหลือ
            </p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {PERSONAL_QUOTA - usedPersonalDays}{" "}
              <span className="text-sm font-normal text-gray-500">
                / {PERSONAL_QUOTA} วัน
              </span>
            </h3>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-lg flex items-center justify-center text-xl font-bold">
            {usedPersonalDays}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
        {/* ฝั่งซ้าย: ฟอร์มยื่นใบลา */}
        <div className="md:col-span-2 p-6 bg-white rounded-xl shadow-md border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            🙋‍♂️ ฟอร์มยื่นใบลาพนักงาน
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                ประเภทการลา
              </label>
              <select
                name="leaveType"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white"
                required
              >
                <option value="SICK">🤒 ลาป่วย (Sick Leave)</option>
                <option value="ANNUAL">🏖️ ลาพักร้อน (Annual Leave)</option>
                <option value="PERSONAL">💼 ลากิจ (Personal Leave)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  เริ่มต้น
                </label>
                <input
                  type="date"
                  name="startDate"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  สิ้นสุด
                </label>
                <input
                  type="date"
                  name="endDate"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                เหตุผลการลา
              </label>
              <textarea
                name="reason"
                rows={3}
                placeholder="ระบุความจำเป็น..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800"
                required
              ></textarea>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-200 font-medium">
                ⚠️ {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-50 text-green-600 text-xs rounded-lg border border-green-200 font-medium">
                🎉 ส่งใบลาสำเร็จ!
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 text-white text-sm font-semibold rounded-lg transition-colors ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {loading ? "กำลังบันทึก..." : "ส่งใบลา"}
            </button>
          </form>
        </div>

        {/* ฝั่งขวา: ตารางแสดงประวัติ */}
        <div className="md:col-span-3 p-6 bg-white rounded-xl shadow-md border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            📋 ประวัติการลาของคุณ
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-600 text-xs font-bold uppercase border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">ประเภท</th>
                  <th className="px-4 py-3">จำนวนวัน</th>
                  <th className="px-4 py-3">สถานะ</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100 text-gray-700">
                {history.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-6 text-center text-gray-400"
                    >
                      ยังไม่มีประวัติการลา
                    </td>
                  </tr>
                ) : (
                  history.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium">
                        {item.leaveType === "SICK"
                          ? "🤒 ลาป่วย"
                          : item.leaveType === "ANNUAL"
                            ? "🏖️ ลาพักร้อน"
                            : "💼 ลากิจ"}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className="font-semibold text-gray-900">
                          {calculateDays(item.startDate, item.endDate)} วัน
                        </span>
                        <div className="text-gray-400 text-[10px]">
                          {new Date(item.startDate).toLocaleDateString("th-TH")}{" "}
                          - {new Date(item.endDate).toLocaleDateString("th-TH")}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 text-xs font-bold rounded-full ${item.status === "APPROVED" ? "bg-green-100 text-green-700" : item.status === "REJECTED" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
