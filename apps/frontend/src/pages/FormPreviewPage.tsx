import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchForm } from "@/lib/forms";
import BlockRenderer from "@/components/public/BlockRenderer";
import { NeuButton } from "@/components/ui/NeuButton";
import { I } from "@/components/ui/Icon";
import type { Block } from "@/lib/types";

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function PreviewSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 bg-gray-200 rounded-lg w-48" />
      <div className="h-4 bg-gray-100 rounded w-64" />
      <div className="h-12 bg-gray-200 rounded-xl w-full" />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function FormPreviewPage() {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();

  const { data: form, isLoading, isError } = useQuery({
    queryKey: ["form", formId],
    queryFn: () => fetchForm(formId!),
    enabled: !!formId,
  });

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* ── Sticky top bar ────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-[#f5f5f5] shadow-neu-sm px-4 py-3 flex items-center gap-3">
        <NeuButton
          variant="ghost"
          size="sm"
          icon="arrow_back"
          onClick={() => navigate(`/forms/${formId}/edit`)}
        >
          กลับไปแก้ไข
        </NeuButton>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
          <I name="visibility" size={14} />
          ตัวอย่าง (Preview Mode)
        </span>
      </div>

      {/* ── Form card ─────────────────────────────────────────────────────── */}
      <div className="flex justify-center px-4 py-8">
        <div className="w-full max-w-xl bg-[#f5f5f5] rounded-3xl shadow-neu p-6 sm:p-8 space-y-6">

          {isLoading && <PreviewSkeleton />}

          {isError && (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <I name="error" size={40} className="text-red-400" />
              <p className="text-sm text-gray-500">ไม่พบแบบฟอร์มนี้</p>
              <NeuButton
                variant="default"
                onClick={() => navigate("/forms")}
              >
                กลับไปรายการ
              </NeuButton>
            </div>
          )}

          {!isLoading && !isError && form && (
            <>
              {/* Amber info banner */}
              <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
                <I name="info" size={16} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  นี่คือตัวอย่างแบบฟอร์ม ผู้สมัครจะเห็นหน้านี้เมื่อกดลิงก์แชร์
                </p>
              </div>

              {/* Logo */}
              {form.logoUrl && (
                <div className="flex justify-center">
                  <img
                    src={form.logoUrl}
                    alt="โลโก้"
                    className="h-16 w-auto object-contain rounded-xl"
                  />
                </div>
              )}

              {/* Title + description */}
              <div>
                <h1 className="text-2xl font-bold text-green-900 font-prompt">
                  {form.title}
                </h1>
                {form.description && (
                  <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                    {form.description}
                  </p>
                )}
              </div>

              {/* Blocks */}
              {form.blocks.length > 0 ? (
                <div className="space-y-5">
                  {form.blocks.map((block: Block) => (
                    <BlockRenderer
                      key={block.id}
                      block={block}
                      value={undefined}
                      onChange={() => {}}
                      readonly={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400">
                  <I name="inbox" size={36} className="mb-2 text-gray-300" />
                  <p className="text-sm">ยังไม่มีฟิลด์ในแบบฟอร์มนี้</p>
                </div>
              )}

              {/* Disabled submit button */}
              <NeuButton
                variant="primary"
                className="w-full justify-center"
                disabled
              >
                ส่งใบสมัคร (ตัวอย่าง)
              </NeuButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
