import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuButton } from "@/components/ui/NeuButton";
import { I } from "@/components/ui/Icon";
import ResponseDrawer from "@/components/ResponseDrawer";
import { fetchResponses, updateResponse } from "@/lib/responses";
import { fetchForms } from "@/lib/forms";
import type { Response, ResponseStatus } from "@/lib/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<
  ResponseStatus,
  { label: string; className: string }
> = {
  new: { label: "ใหม่", className: "bg-blue-500 text-white" },
  reviewing: { label: "กำลังพิจารณา", className: "bg-amber-400 text-white" },
  approved: { label: "อนุมัติ", className: "bg-green-500 text-white" },
  rejected: { label: "ไม่ผ่าน", className: "bg-red-500 text-white" },
};

function getInitials(name?: string): string {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase();
}

function formatThaiDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isTodayTimestamp(timestamp: number): boolean {
  const d = new Date(timestamp);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: string;
  loading?: boolean;
}

function StatCard({ label, value, icon, trend, loading }: StatCardProps) {
  return (
    <NeuCard className="flex items-start gap-4">
      <div
        className="w-10 h-10 rounded-xl bg-green-700
          shadow-[2px_2px_6px_#1a4d24,_-2px_-2px_6px_#48b356]
          flex items-center justify-center shrink-0"
      >
        <I name={icon} size={20} fill={1} className="text-white" />
      </div>
      <div>
        {loading ? (
          <div className="h-7 w-12 bg-gray-200 rounded animate-pulse mb-1" />
        ) : (
          <p className="text-2xl font-semibold text-gray-800">{value}</p>
        )}
        <p className="text-sm text-gray-500">{label}</p>
        {trend && <p className="text-xs text-green-600 mt-0.5">{trend}</p>}
      </div>
    </NeuCard>
  );
}

// ─── Recent Response Row ──────────────────────────────────────────────────────

interface RecentResponseRowProps {
  response: Response;
  onSelect: (r: Response) => void;
  onStarToggle: (id: string, starred: boolean) => void;
}

function RecentResponseRow({
  response,
  onSelect,
  onStarToggle,
}: RecentResponseRowProps) {
  const badge = STATUS_BADGE[response.status];
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(response)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect(response);
      }}
      className="flex items-center gap-3 py-3 border-b border-gray-200/60 last:border-0
        rounded-xl px-2 cursor-pointer hover:bg-green-50/60 transition-colors duration-150
        focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
    >
      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center
          text-white font-semibold text-sm
          bg-gradient-to-br from-green-700 to-green-500
          shadow-[2px_2px_5px_#1a4d24,_-1px_-1px_3px_#48b356]"
        aria-hidden="true"
      >
        {getInitials(response.applicant.name)}
      </div>

      {/* Name + email */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-800 truncate">
          {response.applicant.name ?? "ไม่ระบุชื่อ"}
        </p>
        <p className="text-xs text-gray-400 truncate">
          {response.applicant.email ?? response.applicant.phone ?? "\u00a0"}
        </p>
      </div>

      {/* Status */}
      <span
        className={[
          "hidden sm:inline-flex shrink-0 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",
          badge.className,
        ].join(" ")}
      >
        {badge.label}
      </span>

      {/* Date */}
      <span className="hidden md:block text-xs text-gray-400 shrink-0 whitespace-nowrap">
        {formatThaiDate(response.submittedAt)}
      </span>

      {/* Star */}
      <button
        type="button"
        aria-label={response.starred ? "ยกเลิกดาว" : "ติดดาว"}
        onClick={(e) => {
          e.stopPropagation();
          onStarToggle(response.id, !response.starred);
        }}
        className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full
          hover:bg-amber-50 transition-colors focus:outline-none
          focus-visible:ring-2 focus-visible:ring-amber-400"
      >
        <I
          name="star"
          size={18}
          fill={response.starred ? 1 : 0}
          className={response.starred ? "text-amber-400" : "text-gray-300"}
        />
      </button>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(
    null
  );

  // ── Queries ──────────────────────────────────────────────────────────────────
  const responsesQuery = useQuery({
    queryKey: ["responses", { page: 1, pageSize: 5 }],
    queryFn: () => fetchResponses({ page: 1, pageSize: 5 }),
  });

  const allResponsesQuery = useQuery({
    queryKey: ["responses", { page: 1, pageSize: 200 }],
    queryFn: () => fetchResponses({ page: 1, pageSize: 200 }),
  });

  const formsQuery = useQuery({
    queryKey: ["forms"],
    queryFn: fetchForms,
  });

  // ── Derived stats ─────────────────────────────────────────────────────────────
  const allResponses = allResponsesQuery.data?.responses ?? [];
  const totalResponses = allResponses.length;
  const newToday = allResponses.filter(
    (r) => r.status === "new" && isTodayTimestamp(r.submittedAt)
  ).length;
  const formsCount = formsQuery.data?.forms.length ?? 0;
  const recentResponses = responsesQuery.data?.responses ?? [];

  // ── Star mutation ────────────────────────────────────────────────────────────
  const starMutation = useMutation({
    mutationFn: ({ id, starred }: { id: string; starred: boolean }) =>
      updateResponse(id, { starred }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["responses"] });
    },
  });

  const handleDrawerClose = () => setSelectedResponse(null);

  const handleStatusChanged = () => {
    queryClient.invalidateQueries({ queryKey: ["responses"] });
  };

  const handleDeleted = () => {
    setSelectedResponse(null);
    queryClient.invalidateQueries({ queryKey: ["responses"] });
  };

  const isStatsLoading =
    allResponsesQuery.isLoading || formsQuery.isLoading;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-green-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          ภาพรวมระบบและสถิติการรับสมัคร
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard
          label="ใบสมัครทั้งหมด"
          value={totalResponses}
          icon="inbox"
          loading={isStatsLoading}
        />
        <StatCard
          label="ใหม่วันนี้"
          value={newToday}
          icon="today"
          loading={isStatsLoading}
        />
        <StatCard
          label="แบบฟอร์มทั้งหมด"
          value={formsCount}
          icon="description"
          loading={isStatsLoading}
        />
      </div>

      {/* Onboarding banner — shown only when no forms exist */}
      {!isStatsLoading && formsCount === 0 && (
        <div className="rounded-3xl p-6 bg-gradient-to-br from-green-900 to-green-700 text-white shadow-neu">
          <h2 className="text-lg font-semibold mb-1">ยินดีต้อนรับสู่ HR FormKit 🎉</h2>
          <p className="text-sm text-green-200 mb-4">เริ่มต้นด้วยการสร้างแบบฟอร์มแรกของคุณ</p>
          <Link to="/forms">
            <NeuButton variant="default" icon="add">สร้างแบบฟอร์มแรก</NeuButton>
          </Link>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/forms">
          <NeuCard className="flex items-center gap-4 cursor-pointer hover:scale-[1.01] transition-transform">
            <div className="w-10 h-10 rounded-xl bg-green-700 shadow-[2px_2px_6px_#1a4d24,-2px_-2px_6px_#48b356] flex items-center justify-center shrink-0">
              <I name="add_circle" size={20} fill={1} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-800">สร้างแบบฟอร์มใหม่</p>
              <p className="text-xs text-gray-500">ออกแบบฟอร์มรับสมัครงาน</p>
            </div>
          </NeuCard>
        </Link>
        <Link to="/responses">
          <NeuCard className="flex items-center gap-4 cursor-pointer hover:scale-[1.01] transition-transform">
            <div className="w-10 h-10 rounded-xl bg-blue-600 shadow-[2px_2px_6px_#1d4ed8,-2px_-2px_6px_#60a5fa] flex items-center justify-center shrink-0">
              <I name="inbox" size={20} fill={1} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-800">ดูใบสมัครทั้งหมด</p>
              <p className="text-xs text-gray-500">ตรวจสอบและจัดการใบสมัคร</p>
            </div>
          </NeuCard>
        </Link>
      </div>

      {/* Recent responses */}
      <NeuCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-700">
            ใบสมัครล่าสุด
          </h2>
          <Link
            to="/responses"
            className="text-sm text-green-700 hover:text-green-900 hover:underline
              focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded"
          >
            ดูทั้งหมด &rarr;
          </Link>
        </div>

        {responsesQuery.isLoading && (
          <div className="space-y-0">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-3 border-b border-gray-200/60 last:border-0 animate-pulse"
              >
                <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-gray-200 rounded w-36" />
                  <div className="h-3 bg-gray-100 rounded w-48" />
                </div>
                <div className="h-5 bg-gray-200 rounded-full w-16" />
              </div>
            ))}
          </div>
        )}

        {!responsesQuery.isLoading && recentResponses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
            <I name="inbox" size={40} className="mb-3 text-gray-300" />
            <p className="text-sm">ยังไม่มีใบสมัคร</p>
            <p className="text-xs mt-1">
              สร้างแบบฟอร์มและแชร์ลิงก์เพื่อรับใบสมัคร
            </p>
          </div>
        )}

        {!responsesQuery.isLoading &&
          recentResponses.map((r) => (
            <RecentResponseRow
              key={r.id}
              response={r}
              onSelect={setSelectedResponse}
              onStarToggle={(id, starred) =>
                starMutation.mutate({ id, starred })
              }
            />
          ))}
      </NeuCard>

      {/* Detail Drawer */}
      {selectedResponse && (
        <ResponseDrawer
          response={selectedResponse}
          onClose={handleDrawerClose}
          onStatusChanged={handleStatusChanged}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
