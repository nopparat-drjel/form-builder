import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { shareForm } from "@/lib/forms";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuButton } from "@/components/ui/NeuButton";
import { NeuInput } from "@/components/ui/NeuInput";
import { I } from "@/components/ui/Icon";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ShareModalProps {
  formId: string;
  formTitle: string;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ShareModal({ formId, formTitle, onClose }: ShareModalProps) {
  const [days, setDays] = useState(30);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: () => shareForm(formId, days * 86400),
    onSuccess: (data) => {
      const url = `${window.location.origin}/f/${data.token}`;
      setShareUrl(url);
    },
    onError: () => {
      toast.error("ไม่สามารถสร้างลิงก์แชร์ได้ กรุณาลองใหม่");
    },
  });

  async function handleCopy() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("ไม่สามารถคัดลอกได้");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <NeuCard elevation="raised" className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <I name="share" size={20} className="text-green-700" />
            <h2
              id="share-modal-title"
              className="text-lg font-semibold text-green-900 font-prompt"
            >
              แชร์แบบฟอร์ม
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-200/60 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label="ปิด"
          >
            <I name="close" size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form title */}
        <div className="mb-5 px-4 py-3 rounded-xl bg-[#f5f5f5] shadow-neu-in-sm">
          <p className="text-xs text-gray-400 mb-0.5">แบบฟอร์ม</p>
          <p className="text-sm font-medium text-gray-800 truncate">{formTitle}</p>
        </div>

        {/* Generated link */}
        {shareUrl ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">ลิงก์แชร์</p>
              <div className="flex gap-2">
                <div className="flex-1 px-3 py-2.5 rounded-xl shadow-neu-in-sm bg-[#f5f5f5] text-sm text-gray-600 truncate">
                  {shareUrl}
                </div>
                <NeuButton
                  variant={copied ? "primary" : "default"}
                  size="sm"
                  icon={copied ? "check" : "content_copy"}
                  onClick={handleCopy}
                  className="shrink-0 min-h-[44px]"
                  aria-label="คัดลอกลิงก์"
                >
                  {copied ? "คัดลอกแล้ว!" : "คัดลอก"}
                </NeuButton>
              </div>
            </div>

            <p className="text-xs text-gray-400 flex items-center gap-1">
              <I name="info" size={14} />
              ลิงก์นี้จะหมดอายุใน {days} วัน
            </p>

            <NeuButton
              variant="default"
              className="w-full"
              onClick={() => {
                setShareUrl(null);
                setCopied(false);
              }}
            >
              สร้างลิงก์ใหม่
            </NeuButton>
          </div>
        ) : (
          <div className="space-y-4">
            <NeuInput
              label="ระยะเวลาหมดอายุ (วัน)"
              type="number"
              min={1}
              max={365}
              value={days}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (v >= 1 && v <= 365) setDays(v);
              }}
              helpText="ระหว่าง 1–365 วัน"
            />

            {/* Quick presets */}
            <div className="flex gap-2">
              {([7, 30, 90, 365] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={[
                    "flex-1 py-2 text-xs rounded-xl border transition-all duration-150 min-h-[44px]",
                    days === d
                      ? "border-green-500 bg-green-50 text-green-800 shadow-neu-xs"
                      : "border-transparent bg-[#f5f5f5] text-gray-500 shadow-neu-xs hover:shadow-neu-sm",
                  ].join(" ")}
                >
                  {d === 365 ? "1 ปี" : `${d} วัน`}
                </button>
              ))}
            </div>

            <div className="flex gap-3 pt-1">
              <NeuButton
                variant="default"
                className="flex-1"
                onClick={onClose}
                disabled={isPending}
              >
                ยกเลิก
              </NeuButton>
              <NeuButton
                variant="primary"
                className="flex-1"
                icon="link"
                onClick={() => mutate()}
                loading={isPending}
              >
                สร้างลิงก์
              </NeuButton>
            </div>
          </div>
        )}
      </NeuCard>
    </div>
  );
}

export default ShareModal;
