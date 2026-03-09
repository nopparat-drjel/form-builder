import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { I } from "@/components/ui/Icon";
import NeuButton from "@/components/ui/NeuButton";
import { BlockRenderer } from "@/components/public/BlockRenderer";
import { fetchPublicForm, submitPublicForm, HttpError } from "@/lib/responses";
import type { Block, Applicant } from "@/lib/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatThaiDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Extract applicant fields by scanning block labels for Thai keywords.
 */
function extractApplicant(
  formData: Record<string, unknown>,
  blocks: Block[]
): Applicant {
  const applicant: Applicant = {};

  for (const block of blocks) {
    if (block.type === "section_header") continue;
    const label = block.label.toLowerCase();
    const val = formData[block.id];
    if (!val) continue;

    if (label.includes("ชื่อ") && !applicant.name) {
      applicant.name = String(val);
    } else if (
      (label.includes("อีเมล") || label.includes("email")) &&
      !applicant.email
    ) {
      applicant.email = String(val);
    } else if (
      (label.includes("เบอร์โทร") ||
        label.includes("โทรศัพท์") ||
        label.includes("phone")) &&
      !applicant.phone
    ) {
      applicant.phone = String(val);
    }
  }

  return applicant;
}

/**
 * Validate all required blocks have non-empty values.
 * Returns a map of blockId to error message.
 */
function validateForm(
  formData: Record<string, unknown>,
  blocks: Block[]
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const block of blocks) {
    if (block.type === "section_header") continue;
    if (!block.required) continue;

    const val = formData[block.id];

    if (
      val === undefined ||
      val === null ||
      val === "" ||
      (Array.isArray(val) && val.length === 0)
    ) {
      errors[block.id] = "จำเป็นต้องกรอก";
    }
  }

  return errors;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function FormSkeleton() {
  return (
    <div className="w-full max-w-xl mx-auto px-4 py-10">
      <div className="bg-[#f5f5f5] rounded-3xl shadow-neu px-8 py-10 space-y-6 animate-pulse">
        <div className="h-7 bg-gray-200 rounded-lg w-2/3 mx-auto" />
        <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto" />
        <div className="space-y-4 pt-4">
          <div className="h-12 bg-gray-200 rounded-xl" />
          <div className="h-12 bg-gray-200 rounded-xl" />
          <div className="h-24 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Error State ──────────────────────────────────────────────────────────────

function ErrorState({
  status,
  expiresAt,
}: {
  status: number;
  expiresAt?: number;
}) {
  const is404 = status === 404;
  const is410 = status === 410;

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-10">
      <div className="bg-[#f5f5f5] rounded-3xl shadow-neu px-8 py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 shadow-neu-sm flex items-center justify-center mx-auto mb-5">
          <I
            name={is410 ? "hourglass_empty" : "search_off"}
            size={32}
            className="text-gray-400"
          />
        </div>
        <h1 className="text-lg font-semibold text-gray-700 mb-2">
          {is404
            ? "ไม่พบแบบฟอร์ม"
            : is410
            ? "ลิงก์นี้หมดอายุแล้ว"
            : "เกิดข้อผิดพลาด"}
        </h1>
        <p className="text-sm text-gray-500">
          {is404
            ? "ลิงก์แบบฟอร์มนี้ไม่ถูกต้องหรืออาจถูกลบไปแล้ว"
            : is410
            ? `ลิงก์นี้หมดอายุแล้ว${
                expiresAt ? " เมื่อ " + formatThaiDate(expiresAt) : ""
              }`
            : "กรุณาลองใหม่อีกครั้งหรือติดต่อผู้ดูแลระบบ"}
        </p>
      </div>
    </div>
  );
}

// ─── Success Screen ───────────────────────────────────────────────────────────

function SuccessScreen() {
  return (
    <div className="w-full max-w-xl mx-auto px-4 py-10">
      <div className="bg-[#f5f5f5] rounded-3xl shadow-neu px-8 py-14 text-center">
        <div
          className="w-20 h-20 rounded-full bg-gradient-to-br from-green-700 to-green-500
            shadow-[4px_4px_12px_#1a4d24,_-4px_-4px_12px_#48b356]
            flex items-center justify-center mx-auto mb-6"
          style={{ animation: "scaleIn 0.4s ease-out" }}
        >
          <I name="check" size={36} fill={1} className="text-white" />
        </div>

        <h1 className="text-xl font-semibold text-green-900 mb-2">
          ส่งใบสมัครเรียบร้อยแล้ว!
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          ขอบคุณที่สมัครงาน
          <br />
          ทีมงานจะติดต่อกลับหาท่านโดยเร็วที่สุด
        </p>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PublicFormPage() {
  const { shareToken } = useParams<{ shareToken: string }>();

  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const token = shareToken ?? "";

  const {
    data,
    isLoading,
    isError,
    error: queryError,
  } = useQuery({
    queryKey: ["public-form", token],
    queryFn: () => fetchPublicForm(token),
    enabled: !!token,
    retry: false,
  });

  // Derive HTTP status from the thrown error
  const httpStatus =
    queryError instanceof HttpError ? queryError.status : isError ? 500 : null;

  function setField(blockId: string, value: unknown) {
    setFormData((prev) => ({ ...prev, [blockId]: value }));
    if (errors[blockId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[blockId];
        return next;
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!data) return;

    const validationErrors = validateForm(formData, data.form.blocks);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorId = Object.keys(validationErrors)[0];
      document
        .getElementById(`block-${firstErrorId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);

    try {
      const applicant = extractApplicant(formData, data.form.blocks);
      await submitPublicForm(token, { applicant, data: formData });
      setSubmitted(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองใหม่";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      {/* Minimal header */}
      <header className="px-6 py-4 flex items-center gap-2 border-b border-gray-200/60 shrink-0">
        <I name="article" size={20} fill={1} className="text-green-700" />
        <span className="text-sm font-medium text-green-900">HR FormKit</span>
      </header>

      <main className="flex-1 overflow-y-auto">
        {/* Loading */}
        {isLoading && <FormSkeleton />}

        {/* Error */}
        {!isLoading && isError && !submitted && (
          <ErrorState
            status={httpStatus ?? 500}
            expiresAt={data?.expiresAt}
          />
        )}

        {/* Success */}
        {submitted && <SuccessScreen />}

        {/* Form */}
        {!isLoading && data && !submitted && !isError && (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="w-full max-w-[640px] mx-auto px-4 pb-24 sm:pb-10 pt-8"
          >
            {/* Form header card */}
            <div className="bg-[#f5f5f5] rounded-3xl shadow-neu px-6 sm:px-8 py-8 mb-4">
              {data.form.logoUrl && (
                <div className="flex justify-center mb-5">
                  <div className="rounded-2xl shadow-neu-sm p-3 bg-[#f5f5f5] inline-block">
                    <img
                      src={data.form.logoUrl}
                      alt="โลโก้"
                      className="max-h-[80px] w-auto object-contain block"
                    />
                  </div>
                </div>
              )}
              <h1 className="text-xl sm:text-2xl font-semibold text-green-900 text-center">
                {data.form.title}
              </h1>
              {data.form.description && (
                <p className="text-sm text-gray-500 text-center mt-2 leading-relaxed">
                  {data.form.description}
                </p>
              )}
            </div>

            {/* Blocks */}
            <div className="bg-[#f5f5f5] rounded-3xl shadow-neu px-6 sm:px-8 py-6 space-y-5">
              {data.form.blocks
                .slice()
                .sort(
                  (a: Block, b: Block) => a.order - b.order
                )
                .map((block: Block) => (
                  <BlockRenderer
                    key={block.id}
                    block={block}
                    value={formData[block.id]}
                    onChange={(val) => setField(block.id, val)}
                    error={errors[block.id]}
                  />
                ))}
            </div>

            {/* Submit — sticky on mobile */}
            <div className="fixed sm:static bottom-4 left-4 right-4 sm:mt-4 z-10">
              <NeuButton
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={submitting}
                disabled={submitting}
              >
                ส่งใบสมัคร
              </NeuButton>
            </div>
          </form>
        )}
      </main>

      <footer className="shrink-0 py-4 text-center">
        <p className="text-xs text-gray-400">
          สร้างด้วย{" "}
          <a href="/" className="text-green-600 hover:underline">
            HR FormKit
          </a>
        </p>
      </footer>
    </div>
  );
}
