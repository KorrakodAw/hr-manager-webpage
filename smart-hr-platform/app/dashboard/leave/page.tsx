import LeaveForm from "@/components/LeaveForm";

export default function LeaveDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Smart-HR Self Service
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            ระบบจัดการข้อมูลและคำขอของพนักงานประจำปี 2026
          </p>
        </div>

        {/* แสดงผลฟอร์มยื่นใบลา */}
        <LeaveForm />
      </div>
    </div>
  );
}
