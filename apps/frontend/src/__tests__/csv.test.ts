import { describe, it, expect, vi, beforeEach } from "vitest";
import { exportResponsesCSV } from "@/lib/csv";
import type { Response } from "@/lib/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeResponse(overrides: Partial<Response> = {}): Response {
  return {
    id: "resp-1",
    formId: "form-1",
    applicant: { name: "สมชาย ใจดี", email: "somchai@example.com", phone: null },
    data: {},
    status: "new",
    starred: false,
    submittedAt: 1700000000000,
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("exportResponsesCSV", () => {
  let appendSpy: ReturnType<typeof vi.fn>;
  let clickSpy: ReturnType<typeof vi.fn>;
  let removeSpy: ReturnType<typeof vi.fn>;
  let createdBlobs: Blob[];

  beforeEach(() => {
    createdBlobs = [];

    // Mock Blob
    (globalThis as typeof globalThis & { Blob: unknown }).Blob = class MockBlob {
      content: string;
      type: string;
      constructor(parts: string[], opts?: { type?: string }) {
        this.content = parts.join("");
        this.type = opts?.type ?? "";
        createdBlobs.push(this as unknown as Blob);
      }
    };

    // Mock URL
    (globalThis as typeof globalThis & { URL: unknown }).URL = {
      createObjectURL: vi.fn(() => "blob:mock-url"),
      revokeObjectURL: vi.fn(),
    };

    // Mock document.createElement / body methods
    clickSpy = vi.fn();
    appendSpy = vi.fn();
    removeSpy = vi.fn();

    vi.spyOn(document, "createElement").mockReturnValue({
      href: "",
      download: "",
      style: { display: "" },
      click: clickSpy,
    } as unknown as HTMLElement);

    vi.spyOn(document.body, "appendChild").mockImplementation(appendSpy);
    vi.spyOn(document.body, "removeChild").mockImplementation(removeSpy);
  });

  it("does nothing when responses array is empty", () => {
    exportResponsesCSV([]);
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it("triggers a download link click", () => {
    exportResponsesCSV([makeResponse()]);
    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it("CSV starts with UTF-8 BOM", () => {
    exportResponsesCSV([makeResponse()]);
    const blob = createdBlobs[0] as unknown as { content: string };
    expect(blob.content.startsWith("\uFEFF")).toBe(true);
  });

  it("includes fixed header columns", () => {
    exportResponsesCSV([makeResponse()]);
    const blob = createdBlobs[0] as unknown as { content: string };
    expect(blob.content).toContain("รหัส");
    expect(blob.content).toContain("ชื่อ");
    expect(blob.content).toContain("อีเมล");
    expect(blob.content).toContain("สถานะ");
  });

  it("includes applicant name and email", () => {
    exportResponsesCSV([makeResponse()]);
    const blob = createdBlobs[0] as unknown as { content: string };
    expect(blob.content).toContain("สมชาย ใจดี");
    expect(blob.content).toContain("somchai@example.com");
  });

  it("includes dynamic data columns from response.data", () => {
    const r = makeResponse({ data: { ตำแหน่ง: "Developer", เงินเดือน: "50000" } });
    exportResponsesCSV([r]);
    const blob = createdBlobs[0] as unknown as { content: string };
    expect(blob.content).toContain("ตำแหน่ง");
    expect(blob.content).toContain("Developer");
    expect(blob.content).toContain("เงินเดือน");
  });

  it("merges dynamic columns across multiple responses", () => {
    const r1 = makeResponse({ id: "r1", data: { colA: "v1" } });
    const r2 = makeResponse({ id: "r2", data: { colB: "v2" } });
    exportResponsesCSV([r1, r2]);
    const blob = createdBlobs[0] as unknown as { content: string };
    expect(blob.content).toContain("colA");
    expect(blob.content).toContain("colB");
  });

  it("escapes internal double-quotes in cell values", () => {
    const r = makeResponse({ data: { note: 'say "hello"' } });
    exportResponsesCSV([r]);
    const blob = createdBlobs[0] as unknown as { content: string };
    expect(blob.content).toContain('say ""hello""');
  });

  it("uses custom filename when provided", () => {
    const link = { href: "", download: "", style: { display: "" }, click: clickSpy };
    vi.spyOn(document, "createElement").mockReturnValue(link as unknown as HTMLElement);
    exportResponsesCSV([makeResponse()], "export-test.csv");
    expect(link.download).toBe("export-test.csv");
  });

  it("shows ใช่ for starred and ไม่ for unstarred", () => {
    const r1 = makeResponse({ id: "r1", starred: true });
    const r2 = makeResponse({ id: "r2", starred: false });
    exportResponsesCSV([r1, r2]);
    const blob = createdBlobs[0] as unknown as { content: string };
    expect(blob.content).toContain("ใช่");
    expect(blob.content).toContain("ไม่");
  });
});
