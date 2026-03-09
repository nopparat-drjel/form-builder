import { useRef } from "react";
import { I } from "@/components/ui/Icon";
import NeuButton from "@/components/ui/NeuButton";

// ─── Props ────────────────────────────────────────────────────────────────────

interface LogoUploadProps {
  logoUrl?: string;
  onLogoChange: (dataUrl: string | null) => void;
}

// ─── Resize helper ────────────────────────────────────────────────────────────

const MAX_WIDTH = 400;
const MAX_HEIGHT = 200;
const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2 MB

function resizeImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { naturalWidth: w, naturalHeight: h } = img;

      // Scale down maintaining aspect ratio
      const widthRatio = MAX_WIDTH / w;
      const heightRatio = MAX_HEIGHT / h;
      const ratio = Math.min(widthRatio, heightRatio, 1); // never upscale
      w = Math.round(w * ratio);
      h = Math.round(h * ratio);

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context unavailable"));
        return;
      }

      ctx.drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL("image/png", 0.85);
      resolve(dataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };

    img.src = objectUrl;
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LogoUpload({ logoUrl, onLogoChange }: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!inputRef.current) return;
    // Reset input so same file can be re-selected if needed
    inputRef.current.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      alert("ไฟล์ต้องมีขนาดไม่เกิน 2 MB");
      return;
    }

    try {
      const dataUrl = await resizeImageToDataUrl(file);
      onLogoChange(dataUrl);
    } catch {
      alert("ไม่สามารถประมวลผลรูปภาพได้ กรุณาลองใหม่");
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        โลโก้แบบฟอร์ม
      </p>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-label="อัปโหลดโลโก้"
        onChange={handleFileChange}
      />

      {logoUrl ? (
        /* Preview state */
        <div className="rounded-2xl shadow-neu-sm bg-[#f5f5f5] p-3 flex flex-col items-center gap-3">
          <img
            src={logoUrl}
            alt="โลโก้แบบฟอร์ม"
            className="max-h-[80px] w-auto object-contain rounded-lg"
          />
          <div className="flex items-center gap-2">
            <NeuButton
              size="sm"
              variant="default"
              icon="upload"
              onClick={() => inputRef.current?.click()}
            >
              เปลี่ยนโลโก้
            </NeuButton>
            <NeuButton
              size="sm"
              variant="danger"
              icon="delete"
              onClick={() => onLogoChange(null)}
            >
              ลบ
            </NeuButton>
          </div>
        </div>
      ) : (
        /* Empty upload area */
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-2xl border-2 border-dashed border-gray-300
            shadow-neu-in-sm bg-[#f5f5f5]
            flex flex-col items-center justify-center gap-2
            py-6 px-4
            hover:border-green-400 hover:bg-green-50/30
            transition-colors duration-150
            focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500
            min-h-[44px]"
          aria-label="อัปโหลดโลโก้"
        >
          <I name="upload" size={24} className="text-gray-400" />
          <span className="text-sm text-gray-500">อัปโหลดโลโก้</span>
          <span className="text-xs text-gray-400">PNG, JPG · สูงสุด 2 MB</span>
        </button>
      )}
    </div>
  );
}
