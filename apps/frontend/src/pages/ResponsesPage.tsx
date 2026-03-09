import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { NeuCard } from "@/components/ui/NeuCard";
import { Chip } from "@/components/ui/Chip";
import { I } from "@/components/ui/Icon";
import NeuButton from "@/components/ui/NeuButton";
import { NeuInput } from "@/components/ui/NeuInput";
import ResponseDrawer from "@/components/ResponseDrawer";
import {
  fetchResponses,
  updateResponse,
} from "@/lib/responses";
import type { Response, ResponseStatus } from "@/lib/types";
import { exportResponsesCSV } from "@/lib/csv";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_FILTERS: { label: string; value: ResponseStatus | "all" }[] = [
  { label: "ทั้งหมด", value: "all" },
  { label: "ใหม่", value: "new" },
  { label: "กำลังพิจารณา", value: "reviewing" },
  { label: "อนุมัติ", value: "approved" },
  { label: "ไม่ผ่าน", value: "rejected" },
];

const STATUS_BADGE: Record<
  ResponseStatus,
  { label: string; className: string }
> = {
  new: {
    label: "ใหม่",
    className: "bg-blue-500 text-white",
  },
  reviewing: {
    label: "กำลังพิจารณา",
    className: "bg-amber-400 text-white",
  },
  approved: {
    label: "อนุมัติ",
    className: "bg-green-500 text-white",
  },
  rejected: {
    label: "ไม่ผ่าน",
    className: "bg-red-500 text-white",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name?: string): string {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase();
}

function formatThaiDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPositionFromData(data: Record<string, unknown>): string {
  const positionKeys = ["position", "ตำแหน่ง", "job", "role"];
  for (const key of positionKeys) {
    if (data[key] && typeof data[key] === "string") {
      return data[key] as string;
    }
  }
  // Search case-insensitively through all keys
  for (const [key, val] of Object.entries(data)) {
    if (
      key.toLowerCase().includes("position") ||
      key.toLowerCase().includes("ตำแหน่ง") ||
      key.toLowerCase().includes("job")
    ) {
      if (typeof val === "string") return val;
    }
  }
  return "";
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-200/60 last:border-0 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-40" />
        <div className="h-3 bg-gray-100 rounded w-56" />
      </div>
      <div className="h-6 bg-gray-200 rounded-full w-20" />
      <div className="h-3 bg-gray-100 rounded w-28" />
      <div className="w-8 h-8 rounded-full bg-gray-100" />
    </div>
  );
}

// ─── Response Row ─────────────────────────────────────────────────────────────

interface ResponseRowProps {
  response: Response;
  onSelect: (r: Response) => void;
  onStarToggle: (id: string, starred: boolean) => void;
  isStarLoading: boolean;
}

function ResponseRow({
  response,
  onSelect,
  onStarToggle,
  isStarLoading,
}: ResponseRowProps) {
  const badge = STATUS_BADGE[response.status];
  const position = getPositionFromData(response.data);
  const name = response.applicant.name ?? "ไม่ระบุชื่อ";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(response)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect(response);
      }}
      className="flex items-center gap-3 sm:gap-4 py-3.5 px-2 border-b border-gray-200/60
        last:border-0 rounded-xl cursor-pointer
        hover:bg-green-50/60 transition-colors duration-150
        focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
    >
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center
          text-white font-semibold text-sm select-none
          bg-gradient-to-br from-green-700 to-green-500
          shadow-[2px_2px_6px_#1a4d24,_-1px_-1px_4px_#48b356]"
        aria-hidden="true"
      >
        {getInitials(response.applicant.name)}
      </div>

      {/* Name + contact */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-800 truncate">{name}</p>
        <p className="text-xs text-gray-500 truncate">
          {response.applicant.email ?? response.applicant.phone ?? "\u00a0"}
        </p>
        {position && (
          <p className="text-xs text-green-700 truncate">{position}</p>
        )}
      </div>

      {/* Status badge */}
      <span
        className={[
          "hidden sm:inline-flex shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",
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
        disabled={isStarLoading}
        onClick={(e) => {
          e.stopPropagation();
          onStarToggle(response.id, !response.starred);
        }}
        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full
          hover:bg-amber-50 transition-colors focus:outline-none
          focus-visible:ring-2 focus-visible:ring-amber-400
          disabled:opacity-40"
      >
        <I
          name="star"
          size={20}
          fill={response.starred ? 1 : 0}
          className={response.starred ? "text-amber-400" : "text-gray-300"}
        />
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ResponsesPage() {
  const queryClient = useQueryClient();

  const [activeStatus, setActiveStatus] = useState<ResponseStatus | "all">(
    "all"
  );
  const [starredOnly, setStarredOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(
    null
  );
  const [loadingStarId, setLoadingStarId] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  // ── Query ──────────────────────────────────────────────────────────────────
  const queryKey = ["responses", { status: activeStatus, starred: starredOnly, page }] as const;

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () =>
      fetchResponses({
        status: activeStatus,
        starred: starredOnly || undefined,
        page,
        pageSize: 20,
      }),
  });

  // ── Star mutation ──────────────────────────────────────────────────────────
  const starMutation = useMutation({
    mutationFn: ({
      id,
      starred,
    }: {
      id: string;
      starred: boolean;
    }) => updateResponse(id, { starred }),

    onMutate: async ({ id, starred }) => {
      setLoadingStarId(id);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(
        queryKey,
        (old: typeof data) => {
          if (!old) return old;
          return {
            ...old,
            responses: old.responses.map((r) =>
              r.id === id ? { ...r, starred } : r
            ),
          };
        }
      );

      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(queryKey, ctx.previous);
      }
      toast.error("ไม่สามารถอัปเดตดาวได้");
    },

    onSettled: () => {
      setLoadingStarId(null);
      queryClient.invalidateQueries({ queryKey: ["responses"] });
    },
  });

  // ── Client-side search filter ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!data?.responses) return [];
    if (!search.trim()) return data.responses;
    const q = search.toLowerCase();
    return data.responses.filter((r) =>
      (r.applicant.name ?? "").toLowerCase().includes(q)
    );
  }, [data?.responses, search]);

  // ── CSV export ─────────────────────────────────────────────────────────────
  async function handleExportCSV() {
    setExportLoading(true);
    try {
      const result = await fetchResponses({
        status: activeStatus,
        starred: starredOnly || undefined,
        pageSize: 200,
      });
      exportResponsesCSV(result.responses);
    } catch {
      toast.error("ไม่สามารถส่งออกข้อมูลได้");
    } finally {
      setExportLoading(false);
    }
  }

  // ── Status change from drawer ───────────────────────────────────────────────
  const handleDrawerClose = () => setSelectedResponse(null);

  const handleStatusChanged = () => {
    queryClient.invalidateQueries({ queryKey: ["responses"] });
  };

  const handleDeleted = () => {
    setSelectedResponse(null);
    queryClient.invalidateQueries({ queryKey: ["responses"] });
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-green-900">ใบสมัคร</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data ? `${filtered.length} รายการ` : "กำลังโหลด…"}
          </p>
        </div>
        <NeuButton
          variant="default"
          size="sm"
          icon="download"
          loading={exportLoading}
          onClick={handleExportCSV}
          disabled={exportLoading}
        >
          {exportLoading ? "กำลังส่งออก..." : "ส่งออก CSV"}
        </NeuButton>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status chips */}
        <div
          className="flex flex-wrap gap-2"
          role="listbox"
          aria-label="กรองตามสถานะ"
        >
          {STATUS_FILTERS.map((f) => (
            <Chip
              key={f.value}
              active={activeStatus === f.value}
              onClick={() => {
                setActiveStatus(f.value);
                setPage(1);
              }}
            >
              {f.label}
            </Chip>
          ))}
        </div>

        {/* Starred toggle */}
        <button
          type="button"
          aria-label="แสดงเฉพาะที่ติดดาว"
          aria-pressed={starredOnly}
          onClick={() => {
            setStarredOnly((v) => !v);
            setPage(1);
          }}
          className={[
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
            "transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500",
            starredOnly
              ? "bg-amber-400 text-white shadow-[2px_2px_4px_#b45309,_-2px_-2px_4px_#fde68a]"
              : "bg-[#f5f5f5] text-gray-600 shadow-neu-xs hover:shadow-neu-sm",
          ].join(" ")}
        >
          <I name="star" size={14} fill={starredOnly ? 1 : 0} />
          ติดดาว
        </button>

        {/* Search */}
        <div className="ml-auto w-full sm:w-64">
          <NeuInput
            placeholder="ค้นหาชื่อผู้สมัคร…"
            icon="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="ค้นหาชื่อผู้สมัคร"
          />
        </div>
      </div>

      {/* List card */}
      <NeuCard padding="none" className="overflow-hidden">
        <div className="px-4 py-2">
          {isLoading && (
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <I name="error" size={40} className="text-red-300 mb-3" />
              <p className="text-sm text-gray-500">
                ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง
              </p>
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <I name="inbox" size={40} className="text-gray-300 mb-3" />
              <h3 className="text-base font-medium text-gray-600 mb-1">
                ยังไม่มีใบสมัคร
              </h3>
              <p className="text-sm text-gray-400">
                ใบสมัครจะปรากฏที่นี่เมื่อผู้สมัครกรอกแบบฟอร์ม
              </p>
            </div>
          )}

          {!isLoading &&
            filtered.map((r) => (
              <ResponseRow
                key={r.id}
                response={r}
                onSelect={setSelectedResponse}
                onStarToggle={(id, starred) =>
                  starMutation.mutate({ id, starred })
                }
                isStarLoading={loadingStarId === r.id}
              />
            ))}
        </div>

        {/* Pagination */}
        {data && (data.hasMore || page > 1) && (
          <div className="flex items-center justify-center gap-3 py-4 border-t border-gray-200/60">
            <NeuButton
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ก่อนหน้า
            </NeuButton>
            <span className="text-sm text-gray-500">หน้า {page}</span>
            <NeuButton
              size="sm"
              disabled={!data.hasMore}
              onClick={() => setPage((p) => p + 1)}
            >
              ถัดไป
            </NeuButton>
          </div>
        )}
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
