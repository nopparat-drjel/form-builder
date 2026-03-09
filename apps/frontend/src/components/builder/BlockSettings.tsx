import type { Block, TextBlock, NumberBlock, ChoiceBlock, FileUploadBlock, SectionHeaderBlock } from "@/lib/types";
import { NeuInput } from "@/components/ui/NeuInput";
import { Toggle } from "@/components/ui/Toggle";
import { NeuButton } from "@/components/ui/NeuButton";
import { I } from "@/components/ui/Icon";

// ─── Type guards ──────────────────────────────────────────────────────────────

function isTextBlock(block: Block): block is TextBlock {
  return ["short_text", "long_text", "email", "phone"].includes(block.type);
}

function isNumberBlock(block: Block): block is NumberBlock {
  return block.type === "number";
}

function isChoiceBlock(block: Block): block is ChoiceBlock {
  return ["dropdown", "radio", "checkbox"].includes(block.type);
}

function isFileUploadBlock(block: Block): block is FileUploadBlock {
  return block.type === "file_upload";
}

function isSectionHeaderBlock(block: Block): block is SectionHeaderBlock {
  return block.type === "section_header";
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {title}
      </p>
      {children}
    </div>
  );
}

// ─── Accepted file types config ───────────────────────────────────────────────

const FILE_TYPE_OPTIONS = [
  { value: "image/*", label: "รูปภาพ (JPG, PNG, GIF)" },
  { value: "application/pdf", label: "PDF" },
  { value: ".doc,.docx", label: "Word Document" },
] as const;

// ─── Props ────────────────────────────────────────────────────────────────────

interface BlockSettingsProps {
  block: Block;
  onChange: (patch: Partial<Block>) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BlockSettings({ block, onChange }: BlockSettingsProps) {
  // ── Choice block: options management ──────────────────────────────────────

  function addOption() {
    if (!isChoiceBlock(block)) return;
    const next = [...block.options, `ตัวเลือก ${block.options.length + 1}`];
    onChange({ options: next } as Partial<ChoiceBlock>);
  }

  function updateOption(index: number, value: string) {
    if (!isChoiceBlock(block)) return;
    const next = [...block.options];
    next[index] = value;
    onChange({ options: next } as Partial<ChoiceBlock>);
  }

  function removeOption(index: number) {
    if (!isChoiceBlock(block)) return;
    const next = block.options.filter((_, i) => i !== index);
    onChange({ options: next } as Partial<ChoiceBlock>);
  }

  function moveOption(from: number, to: number) {
    if (!isChoiceBlock(block)) return;
    const next = [...block.options];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange({ options: next } as Partial<ChoiceBlock>);
  }

  // ── File upload: accepted types ───────────────────────────────────────────

  function toggleAcceptedType(value: string) {
    if (!isFileUploadBlock(block)) return;
    const current = block.acceptedTypes;
    const next = current.includes(value)
      ? current.filter((t) => t !== value)
      : [...current, value];
    onChange({ acceptedTypes: next } as Partial<FileUploadBlock>);
  }

  return (
    <div className="space-y-5">
      {/* ── Common fields ─────────────────────────────────────── */}
      <Section title="ทั่วไป">
        <NeuInput
          label="ชื่อฟิลด์"
          value={block.label}
          onChange={(e) => onChange({ label: e.target.value } as Partial<Block>)}
          placeholder="ชื่อฟิลด์..."
        />
        <NeuInput
          label="ข้อความช่วยเหลือ"
          value={block.helpText ?? ""}
          onChange={(e) =>
            onChange({ helpText: e.target.value || undefined } as Partial<Block>)
          }
          placeholder="คำแนะนำสำหรับผู้กรอกแบบฟอร์ม..."
        />
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-gray-700">จำเป็นต้องกรอก</span>
          <Toggle
            checked={block.required}
            onChange={(v) => onChange({ required: v } as Partial<Block>)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700">ความกว้าง</span>
          <div className="flex gap-2">
            {(["full", "half"] as const).map((span) => {
              const colSpan = (block as Block & { colSpan?: "full" | "half" }).colSpan ?? "full";
              return (
                <button
                  key={span}
                  onClick={() => onChange({ colSpan: span } as Partial<Block>)}
                  className={[
                    "flex-1 py-2 text-xs rounded-xl border transition-all duration-150",
                    "min-h-[44px]",
                    colSpan === span
                      ? "border-green-500 bg-green-50 text-green-800 shadow-neu-xs"
                      : "border-transparent bg-[#f5f5f5] text-gray-500 shadow-neu-xs hover:shadow-neu-sm",
                  ].join(" ")}
                >
                  {span === "full" ? "เต็มแถว" : "ครึ่งแถว"}
                </button>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ── Text block settings ──────────────────────────────── */}
      {isTextBlock(block) && (
        <Section title="ตัวเลือกข้อความ">
          <NeuInput
            label="Placeholder"
            value={block.placeholder ?? ""}
            onChange={(e) =>
              onChange({ placeholder: e.target.value } as Partial<TextBlock>)
            }
            placeholder="ข้อความตัวอย่าง..."
          />
        </Section>
      )}

      {/* ── Number block settings ────────────────────────────── */}
      {isNumberBlock(block) && (
        <Section title="ตัวเลือกตัวเลข">
          <NeuInput
            label="Placeholder"
            value={block.placeholder ?? ""}
            onChange={(e) =>
              onChange({ placeholder: e.target.value } as Partial<NumberBlock>)
            }
            placeholder="เช่น กรอกจำนวน..."
          />
          <div className="grid grid-cols-2 gap-2">
            <NeuInput
              label="ค่าต่ำสุด"
              type="number"
              value={block.min ?? ""}
              onChange={(e) =>
                onChange({
                  min: e.target.value !== "" ? Number(e.target.value) : undefined,
                } as Partial<NumberBlock>)
              }
              placeholder="0"
            />
            <NeuInput
              label="ค่าสูงสุด"
              type="number"
              value={block.max ?? ""}
              onChange={(e) =>
                onChange({
                  max: e.target.value !== "" ? Number(e.target.value) : undefined,
                } as Partial<NumberBlock>)
              }
              placeholder="100"
            />
          </div>
        </Section>
      )}

      {/* ── Choice block settings ────────────────────────────── */}
      {isChoiceBlock(block) && (
        <Section title="ตัวเลือก">
          <div className="space-y-2">
            {block.options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <button
                  onClick={() => index > 0 && moveOption(index, index - 1)}
                  disabled={index === 0}
                  className="shrink-0 p-1 rounded text-gray-300 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="ย้ายขึ้น"
                >
                  <I name="arrow_upward" size={16} />
                </button>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className="flex-1 bg-[#f5f5f5] text-sm text-gray-800 rounded-lg px-3 py-2 shadow-neu-in-sm border border-transparent focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all duration-150 min-h-[44px]"
                  placeholder={`ตัวเลือก ${index + 1}`}
                />
                <button
                  onClick={() =>
                    index < block.options.length - 1 && moveOption(index, index + 1)
                  }
                  disabled={index === block.options.length - 1}
                  className="shrink-0 p-1 rounded text-gray-300 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="ย้ายลง"
                >
                  <I name="arrow_downward" size={16} />
                </button>
                <button
                  onClick={() => removeOption(index)}
                  disabled={block.options.length <= 1}
                  className="shrink-0 p-1 rounded text-gray-300 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="ลบตัวเลือก"
                >
                  <I name="close" size={16} />
                </button>
              </div>
            ))}
          </div>
          <NeuButton
            variant="default"
            size="sm"
            icon="add"
            onClick={addOption}
            className="w-full min-h-[44px]"
          >
            เพิ่มตัวเลือก
          </NeuButton>

          {block.type === "radio" && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-gray-700">แสดงแนวนอน</span>
              <Toggle
                checked={block.multiple ?? false}
                onChange={(v) => onChange({ multiple: v } as Partial<ChoiceBlock>)}
              />
            </div>
          )}
        </Section>
      )}

      {/* ── File upload settings ─────────────────────────────── */}
      {isFileUploadBlock(block) && (
        <Section title="ตัวเลือกไฟล์">
          <NeuInput
            label="ขนาดไฟล์สูงสุด (MB)"
            type="number"
            min={1}
            max={100}
            value={block.maxSizeMb}
            onChange={(e) =>
              onChange({ maxSizeMb: Number(e.target.value) } as Partial<FileUploadBlock>)
            }
          />
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">ประเภทไฟล์ที่รับ</span>
            {FILE_TYPE_OPTIONS.map(({ value, label }) => {
              const checked = block.acceptedTypes.includes(value);
              return (
                <label
                  key={value}
                  className="flex items-center gap-2.5 cursor-pointer min-h-[44px] py-1"
                >
                  <div
                    className={[
                      "w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all duration-150",
                      checked
                        ? "bg-green-700 shadow-[2px_2px_4px_#1a4d24,_-2px_-2px_4px_#48b356]"
                        : "bg-[#f5f5f5] shadow-neu-in-sm",
                    ].join(" ")}
                    onClick={() => toggleAcceptedType(value)}
                  >
                    {checked && <I name="check" size={14} className="text-white" />}
                  </div>
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              );
            })}
          </div>
        </Section>
      )}

      {/* ── Section header settings ──────────────────────────── */}
      {isSectionHeaderBlock(block) && (
        <Section title="ตัวเลือกหัวข้อ">
          <NeuInput
            label="หัวข้อรอง"
            value={block.subtitle ?? ""}
            onChange={(e) =>
              onChange({
                subtitle: e.target.value || undefined,
              } as Partial<SectionHeaderBlock>)
            }
            placeholder="คำอธิบายหัวข้อ..."
          />
        </Section>
      )}
    </div>
  );
}

export default BlockSettings;
