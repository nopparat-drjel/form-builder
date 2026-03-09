import type { Response, ResponseStatus } from "@/lib/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<ResponseStatus, string> = {
  new: "ใหม่",
  reviewing: "กำลังพิจารณา",
  approved: "อนุมัติ",
  rejected: "ไม่ผ่าน",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = Array.isArray(value) ? value.join(", ") : String(value);
  // Wrap in double quotes and escape any internal double quotes
  return `"${str.replace(/"/g, '""')}"`;
}

function formatIsoDate(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

// ─── Export function ──────────────────────────────────────────────────────────

export function exportResponsesCSV(
  responses: Response[],
  filename?: string
): void {
  if (responses.length === 0) return;

  // Collect all unique data keys across all responses (preserves insertion order)
  const dataKeySet = new Set<string>();
  for (const r of responses) {
    for (const key of Object.keys(r.data)) {
      dataKeySet.add(key);
    }
  }
  const dataKeys = Array.from(dataKeySet);

  // Build header row
  const fixedHeaders = [
    "รหัส",
    "ชื่อ",
    "อีเมล",
    "โทรศัพท์",
    "สถานะ",
    "ติดดาว",
    "วันที่ส่ง",
  ];
  const headers = [...fixedHeaders, ...dataKeys];
  const headerRow = headers.map(escapeCell).join(",");

  // Build data rows
  const dataRows = responses.map((r) => {
    const fixed = [
      r.id,
      r.applicant.name ?? "",
      r.applicant.email ?? "",
      r.applicant.phone ?? "",
      STATUS_LABEL[r.status],
      r.starred ? "ใช่" : "ไม่",
      formatIsoDate(r.submittedAt),
    ];

    const dynamicCells = dataKeys.map((key) => r.data[key] ?? "");

    return [...fixed, ...dynamicCells].map(escapeCell).join(",");
  });

  // Add BOM so Excel correctly opens UTF-8 Thai text
  const csvContent = "\uFEFF" + [headerRow, ...dataRows].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename ?? `responses-${Date.now()}.csv`;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Release the object URL after a short delay
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
