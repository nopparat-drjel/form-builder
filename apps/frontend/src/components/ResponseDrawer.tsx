import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { I } from "@/components/ui/Icon";
import NeuButton from "@/components/ui/NeuButton";
import { updateResponse, deleteResponse } from "@/lib/responses";
import type { Response, ResponseStatus } from "@/lib/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: ResponseStatus; label: string }[] = [
  { value: "new", label: "ใหม่" },
  { value: "reviewing", label: "กำลังพิจารณา" },
  { value: "approved", label: "อนุมัติ" },
  { value: "rejected", label: "ไม่ผ่าน" },
];

const STATUS_COLOR: Record<ResponseStatus, string> = {
  new: "text-blue-600",
  reviewing: "text-amber-600",
  approved: "text-green-600",
  rejected: "text-red-600",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name?: string): string {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase();
}

function formatThaiDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ResponseDrawerProps {
  response: Response;
  onClose: () => void;
  onStatusChanged: () => void;
  onDeleted: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ResponseDrawer({
  response,
  onClose,
  onStatusChanged,
  onDeleted,
}: ResponseDrawerProps) {
  const queryClient = useQueryClient();
  const drawerRef = useRef<HTMLDivElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Local optimistic state for status + star
  const [localStatus, setLocalStatus] = useState<ResponseStatus>(
    response.status
  );
  const [localStarred, setLocalStarred] = useState(response.starred);

  // Sync when prop changes (e.g. external update)
  useEffect(() => {
    setLocalStatus(response.status);
    setLocalStarred(response.starred);
  }, [response.id, response.status, response.starred]);

  // ── Trap focus & close on Escape ────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // ── Status mutation ──────────────────────────────────────────────────────────
  const statusMutation = useMutation({
    mutationFn: (status: ResponseStatus) =>
      updateResponse(response.id, { status }),

    onMutate: (status) => {
      setLocalStatus(status);
    },

    onError: () => {
      setLocalStatus(response.status);
      toast.error("ไม่สามารถเปลี่ยนสถานะได้");
    },

    onSuccess: () => {
      toast.success("อัปเดตสถานะแล้ว");
      queryClient.invalidateQueries({ queryKey: ["responses"] });
      onStatusChanged();
    },
  });

  // ── Star mutation ────────────────────────────────────────────────────────────
  const starMutation = useMutation({
    mutationFn: (starred: boolean) =>
      updateResponse(response.id, { starred }),

    onMutate: (starred) => {
      setLocalStarred(starred);
    },

    onError: () => {
      setLocalStarred(response.starred);
      toast.error("ไม่สามารถอัปเดตดาวได้");
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["responses"] });
      onStatusChanged();
    },
  });

  // ── Delete mutation ──────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: () => deleteResponse(response.id),

    onSuccess: () => {
      toast.success("ลบใบสมัครแล้ว");
      onDeleted();
    },

    onError: () => {
      toast.error("ไม่สามารถลบใบสมัครได้");
    },
  });

  // ── Render answer entries ────────────────────────────────────────────────────
  const answerEntries = Object.entries(response.data).filter(([, v]) => {
    if (v === null || v === undefined || v === "") return false;
    if (Array.isArray(v) && v.length === 0) return false;
    return true;
  });

  return (
    <>
      {/* Print styles — A4 optimised */}
      <style>{`
        @media print {
          body > *:not(#response-drawer-root) { display: none !important; }

          #response-drawer-root {
            position: static !important;
            width: 100% !important;
            height: auto !important;
            box-shadow: none !important;
            overflow: visible !important;
            animation: none !important;
          }

          .drawer-no-print { display: none !important; }

          body { background: white !important; font-family: 'Sarabun', sans-serif; }

          @page { size: A4 portrait; margin: 20mm 25mm; }

          .print-header { display: flex !important; }
          .print-title { font-size: 20pt; font-weight: 700; color: #1a4d24; }
          .print-subtitle { font-size: 10pt; color: #6b7280; }
          .print-meta { font-size: 9pt; color: #9ca3af; }
          .print-rule { display: block !important; border: none; border-top: 2px solid #1a4d24; margin: 8pt 0 16pt; }

          .print-section-title {
            display: block !important;
            font-size: 10pt;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #6b7280;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 4pt;
            margin-bottom: 8pt;
          }

          .print-field { margin-bottom: 8pt; }
          .print-field-label { font-size: 8pt; color: #9ca3af; margin-bottom: 2pt; }
          .print-field-value { font-size: 11pt; color: #1f2937; }

          .print-timeline-item { font-size: 9pt; }

          /* Make body sections stack vertically for print */
          .print-body-scroll {
            overflow: visible !important;
            height: auto !important;
          }
        }
      `}</style>

      {/* Print-only document header (hidden on screen, visible when printing) */}
      <div className="print-header hidden" style={{ flexDirection: "column", marginBottom: "8pt" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p className="print-title">ใบสมัครงาน</p>
            <p className="print-subtitle">
              {response.applicant.name ?? "ไม่ระบุชื่อ"}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p className="print-meta">{formatThaiDate(response.submittedAt)}</p>
            <p className="print-meta" style={{ fontFamily: "monospace", fontSize: "8pt" }}>
              {response.id}
            </p>
          </div>
        </div>
        <hr className="print-rule" />
      </div>

      {/* Backdrop */}
      <div
        className="drawer-no-print fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        id="response-drawer-root"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="รายละเอียดใบสมัคร"
        className="fixed top-0 right-0 h-full w-full sm:w-[480px] z-50
          bg-[#f5f5f5] shadow-[-8px_0_24px_rgba(0,0,0,0.12)]
          flex flex-col
          animate-[slideInRight_0.25s_ease-out]"
        style={{
          // Inline animation fallback for environments without custom keyframes
          animation: "slideInRight 0.25s ease-out",
        }}
      >
        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <header className="drawer-no-print shrink-0 px-6 py-4 border-b border-gray-200/60 flex items-start gap-4">
          {/* Close */}
          <button
            type="button"
            aria-label="ปิด"
            onClick={onClose}
            className="mt-0.5 w-8 h-8 rounded-full shadow-neu-xs flex items-center justify-center
              hover:shadow-neu-sm transition-all text-gray-500 hover:text-gray-700
              focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            <I name="close" size={18} />
          </button>

          {/* Avatar + name */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center
                text-white font-semibold text-sm
                bg-gradient-to-br from-green-700 to-green-500
                shadow-[2px_2px_6px_#1a4d24,_-1px_-1px_4px_#48b356]"
              aria-hidden="true"
            >
              {getInitials(response.applicant.name)}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-800 truncate">
                {response.applicant.name ?? "ไม่ระบุชื่อ"}
              </p>
              <p className="text-xs text-gray-500">
                {formatThaiDate(response.submittedAt)}
              </p>
            </div>
          </div>

          {/* Star */}
          <button
            type="button"
            aria-label={localStarred ? "ยกเลิกดาว" : "ติดดาว"}
            disabled={starMutation.isPending}
            onClick={() => starMutation.mutate(!localStarred)}
            className="w-8 h-8 rounded-full flex items-center justify-center
              hover:bg-amber-50 transition-colors shrink-0
              focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400
              disabled:opacity-40"
          >
            <I
              name="star"
              size={20}
              fill={localStarred ? 1 : 0}
              className={localStarred ? "text-amber-400" : "text-gray-300"}
            />
          </button>
        </header>

        {/* Status select */}
        <div className="drawer-no-print shrink-0 px-6 py-3 border-b border-gray-200/60 flex items-center gap-3">
          <label
            htmlFor="drawer-status-select"
            className="text-sm text-gray-500 shrink-0"
          >
            สถานะ:
          </label>
          <select
            id="drawer-status-select"
            value={localStatus}
            disabled={statusMutation.isPending}
            onChange={(e) =>
              statusMutation.mutate(e.target.value as ResponseStatus)
            }
            className={[
              "flex-1 text-sm font-medium rounded-xl px-3 py-2",
              "bg-[#f5f5f5] shadow-neu-in-sm border border-transparent",
              "focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500",
              "transition-all duration-150 disabled:opacity-50",
              STATUS_COLOR[localStatus],
            ].join(" ")}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* ── Body (scrollable) ────────────────────────────────────────────────── */}
        <div className="print-body-scroll flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Applicant info */}
          <section aria-labelledby="drawer-applicant-heading">
            <h2
              id="drawer-applicant-heading"
              className="print-section-title text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3"
            >
              ข้อมูลผู้สมัคร
            </h2>
            <div className="space-y-2">
              {[
                {
                  icon: "person",
                  label: "ชื่อ",
                  value: response.applicant.name,
                },
                {
                  icon: "email",
                  label: "อีเมล",
                  value: response.applicant.email,
                },
                {
                  icon: "phone",
                  label: "โทรศัพท์",
                  value: response.applicant.phone,
                },
              ]
                .filter((row) => row.value)
                .map((row) => (
                  <div
                    key={row.label}
                    className="print-field flex items-start gap-3 rounded-xl px-3 py-2.5
                      bg-[#f5f5f5] shadow-neu-in-sm"
                  >
                    <I
                      name={row.icon}
                      size={16}
                      className="text-green-700 mt-0.5 shrink-0 drawer-no-print"
                    />
                    <div className="min-w-0">
                      <p className="print-field-label text-xs text-gray-400">{row.label}</p>
                      <p className="print-field-value text-sm text-gray-800 break-all">
                        {row.value}
                      </p>
                    </div>
                  </div>
                ))}

              {!response.applicant.name &&
                !response.applicant.email &&
                !response.applicant.phone && (
                  <p className="text-sm text-gray-400 italic">
                    ไม่มีข้อมูลผู้สมัคร
                  </p>
                )}
            </div>
          </section>

          {/* Answers */}
          <section aria-labelledby="drawer-answers-heading">
            <h2
              id="drawer-answers-heading"
              className="print-section-title text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3"
            >
              คำตอบ
            </h2>
            {answerEntries.length === 0 ? (
              <p className="text-sm text-gray-400 italic">ไม่มีคำตอบ</p>
            ) : (
              <div className="space-y-2">
                {answerEntries.map(([key, value]) => {
                  const displayVal = formatValue(value);
                  if (!displayVal) return null;
                  return (
                    <div
                      key={key}
                      className="print-field rounded-xl px-3 py-2.5 bg-[#f5f5f5] shadow-neu-in-sm"
                    >
                      <p className="print-field-label text-xs text-gray-400 mb-0.5">{key}</p>
                      <p className="print-field-value text-sm text-gray-800 break-words">
                        {displayVal}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Timeline */}
          <section aria-labelledby="drawer-timeline-heading">
            <h2
              id="drawer-timeline-heading"
              className="print-section-title text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3"
            >
              ไทม์ไลน์
            </h2>
            <ol className="relative border-l-2 border-gray-200 pl-5 space-y-4">
              <li>
                <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-400 border-2 border-[#f5f5f5]" />
                <p className="print-timeline-item text-xs font-medium text-gray-700">ส่งใบสมัคร</p>
                <p className="print-timeline-item text-xs text-gray-400">
                  {formatThaiDate(response.submittedAt)}
                </p>
              </li>
              {response.reviewedAt && (
                <li className="relative">
                  <span className="absolute -left-[17px] top-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-[#f5f5f5]" />
                  <p className="print-timeline-item text-xs font-medium text-gray-700">
                    เริ่มพิจารณา
                  </p>
                  <p className="print-timeline-item text-xs text-gray-400">
                    {formatThaiDate(response.reviewedAt)}
                  </p>
                </li>
              )}
              {response.approvedAt && (
                <li className="relative">
                  <span className="absolute -left-[17px] top-1 w-4 h-4 rounded-full bg-green-500 border-2 border-[#f5f5f5]" />
                  <p className="print-timeline-item text-xs font-medium text-gray-700">อนุมัติ</p>
                  <p className="print-timeline-item text-xs text-gray-400">
                    {formatThaiDate(response.approvedAt)}
                  </p>
                </li>
              )}
            </ol>
          </section>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────────── */}
        <footer className="drawer-no-print shrink-0 px-6 py-4 border-t border-gray-200/60 flex items-center gap-3">
          {/* Delete */}
          {!confirmDelete ? (
            <NeuButton
              variant="danger"
              size="sm"
              icon="delete"
              onClick={() => setConfirmDelete(true)}
            >
              ลบ
            </NeuButton>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-500">ยืนยันการลบ?</span>
              <NeuButton
                variant="danger"
                size="sm"
                loading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate()}
              >
                ยืนยัน
              </NeuButton>
              <NeuButton
                size="sm"
                onClick={() => setConfirmDelete(false)}
              >
                ยกเลิก
              </NeuButton>
            </div>
          )}

          <div className="flex-1" />

          {/* Print */}
          <NeuButton
            size="sm"
            icon="print"
            onClick={() => window.print()}
          >
            พิมพ์
          </NeuButton>

          {/* Save PDF */}
          <NeuButton
            size="sm"
            icon="picture_as_pdf"
            onClick={() => window.print()}
          >
            บันทึก PDF
          </NeuButton>
        </footer>
      </div>

      {/* Slide-in animation keyframe */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
