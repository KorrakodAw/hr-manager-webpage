"use client";

import { useEffect, useState } from "react";

interface LeaveRequest {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  user: {
    name: string;
    email: string;
  };
}

export default function ManagerDashboard() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // 🧠 ซิงโครไนซ์ข้อมูลจากระบบหลังบ้าน Express
  useEffect(() => {
    let isMounted = true;

    async function fetchRequests() {
      if (!apiUrl) return; // ป้องกันกรณีตัวแปร Env ยังโหลดไม่เสร็จ
      try {
        setLoading(true);
        const response = await fetch(`${apiUrl}/leave`);
        const result = await response.json();

        if (result.success && isMounted) {
          setRequests(result.data);
        }
      } catch (error) {
        console.error("ดาวน์โหลดข้อมูลล้มเหลว:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchRequests();

    return () => {
      isMounted = false;
    };
  }, [refreshKey, apiUrl]);

  // 🚀 ฟังก์ชันส่งคำขอ PATCH ไปเปลี่ยนสถานะรายใบลา
  async function handleStatusUpdate(
    id: string,
    newStatus: "APPROVED" | "REJECTED",
  ) {
    if (!apiUrl) return;
    try {
      const response = await fetch(`${apiUrl}/leave/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "ไม่สามารถอัปเดตสถานะบนเซิร์ฟเวอร์ได้");
      }

      // สะกิดให้ useEffect ด้านบนดึงข้อมูลล่าสุดมาอัปเดตหน้าจอทันที
      setRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    }
  }

  if (loading && requests.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 font-medium">
        🔄 กำลังดึงข้อมูลคำขออนุมัติจากระบบหลังบ้าน...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            👔 แดชบอร์ดผู้บริหาร / HR
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            จัดการและพิจารณาคำขออนุมัติวันลาของพนักงานในบริษัท
          </p>
        </div>
        <button
          onClick={() => setRefreshKey((prev) => prev + 1)}
          className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 border border-gray-300 rounded-lg text-sm transition-colors shadow-sm self-start sm:self-auto"
        >
          🔄 รีเฟรชข้อมูล
        </button>
      </div>

      <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-6 py-3.5">ชื่อพนักงาน</th>
                <th className="px-6 py-3.5">ประเภทการลา</th>
                <th className="px-6 py-3.5">วันที่ลา</th>
                <th className="px-6 py-3.5">เหตุผล</th>
                <th className="px-6 py-3.5">สถานะระบบ</th>
                <th className="px-6 py-3.5 text-center">การพิจารณา</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
              {requests.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-400 font-medium"
                  >
                    📭 ปัจจุบันยังไม่มีพนักงานยื่นใบลาเข้ามาในระบบ
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">
                        {req.user?.name || "พนักงานทั่วไป"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {req.user?.email || "no-email@company.com"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                          req.leaveType === "SICK"
                            ? "bg-red-50 text-red-600 border border-red-100"
                            : req.leaveType === "ANNUAL"
                              ? "bg-blue-50 text-blue-600 border border-blue-100"
                              : "bg-amber-50 text-amber-600 border border-amber-100"
                        }`}
                      >
                        {req.leaveType === "SICK"
                          ? "🤒 ลาป่วย"
                          : req.leaveType === "ANNUAL"
                            ? "🏖️ ลาพักร้อน"
                            : "💼 ลากิจ"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600 font-medium">
                      {new Date(req.startDate).toLocaleDateString("th-TH")} -{" "}
                      {new Date(req.endDate).toLocaleDateString("th-TH")}
                    </td>
                    <td
                      className="px-6 py-4 text-gray-500 max-w-xs truncate"
                      title={req.reason}
                    >
                      {req.reason}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          req.status === "APPROVED"
                            ? "bg-green-100 text-green-700"
                            : req.status === "REJECTED"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        ● {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center space-x-2 whitespace-nowrap">
                      {req.status === "PENDING" ? (
                        <>
                          <button
                            onClick={() =>
                              handleStatusUpdate(req.id, "APPROVED")
                            }
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1.5 px-3 rounded-lg text-xs transition-colors shadow-sm"
                          >
                            อนุมัติ
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(req.id, "REJECTED")
                            }
                            className="bg-white hover:bg-red-50 text-red-600 border border-red-200 font-semibold py-1.5 px-3 rounded-lg text-xs transition-colors"
                          >
                            ปฏิเสธ
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          เสร็จสิ้นแล้ว
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
