import { useRef } from "react";
import type { Block, ChoiceBlock, FileUploadBlock, SectionHeaderBlock, TextBlock, NumberBlock, DateBlock } from "@/lib/types";

// ─── Shared field wrapper ─────────────────────────────────────────────────────

interface FieldWrapperProps {
  label: string;
  required: boolean;
  helpText?: string;
  error?: string;
  children: React.ReactNode;
  htmlFor?: string;
}

function FieldWrapper({
  label,
  required,
  helpText,
  error,
  children,
  htmlFor,
}: FieldWrapperProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="text-xs text-gray-400">{helpText}</p>
      )}
    </div>
  );
}

// ─── Shared input className ───────────────────────────────────────────────────

const inputClass =
  "w-full min-h-[48px] bg-[#f5f5f5] text-gray-800 text-sm rounded-xl px-4 py-3 " +
  "shadow-[inset_2px_2px_4px_#cecece,inset_-2px_-2px_4px_#ffffff] " +
  "border border-transparent " +
  "focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 " +
  "placeholder:text-gray-400 transition-all duration-150 " +
  "disabled:opacity-60 disabled:cursor-not-allowed";

// ─── Block Renderer Props ─────────────────────────────────────────────────────

export interface BlockRendererProps {
  block: Block;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  readonly?: boolean;
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeaderRenderer({ block }: { block: SectionHeaderBlock }) {
  return (
    <div className="pt-4 border-l-4 border-green-700 pl-4">
      <h2 className="text-base font-semibold text-green-900">{block.label}</h2>
      {block.subtitle && (
        <p className="text-sm text-gray-500 mt-0.5">{block.subtitle}</p>
      )}
    </div>
  );
}

// ─── Text / Email / Phone ────────────────────────────────────────────────────

function TextRenderer({ block, value, onChange, error, readonly }: BlockRendererProps & { block: TextBlock }) {
  const inputId = `block-${block.id}`;
  const typeMap: Record<string, React.InputHTMLAttributes<HTMLInputElement>["type"]> = {
    email: "email",
    phone: "tel",
    short_text: "text",
    long_text: "text",
  };

  return (
    <FieldWrapper
      label={block.label}
      required={block.required}
      helpText={block.helpText}
      error={error}
      htmlFor={inputId}
    >
      <input
        id={inputId}
        type={typeMap[block.type] ?? "text"}
        placeholder={block.placeholder}
        required={block.required}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        aria-invalid={!!error}
        disabled={readonly}
      />
    </FieldWrapper>
  );
}

// ─── Long Text ────────────────────────────────────────────────────────────────

function LongTextRenderer({ block, value, onChange, error, readonly }: BlockRendererProps & { block: TextBlock }) {
  const inputId = `block-${block.id}`;
  return (
    <FieldWrapper
      label={block.label}
      required={block.required}
      helpText={block.helpText}
      error={error}
      htmlFor={inputId}
    >
      <textarea
        id={inputId}
        placeholder={block.placeholder}
        required={block.required}
        rows={4}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        className={[
          inputClass,
          "resize-y min-h-[96px]",
        ].join(" ")}
        aria-invalid={!!error}
        style={{ minHeight: "96px" }}
        disabled={readonly}
      />
    </FieldWrapper>
  );
}

// ─── Number ───────────────────────────────────────────────────────────────────

function NumberRenderer({ block, value, onChange, error, readonly }: BlockRendererProps & { block: NumberBlock }) {
  const inputId = `block-${block.id}`;
  return (
    <FieldWrapper
      label={block.label}
      required={block.required}
      helpText={block.helpText}
      error={error}
      htmlFor={inputId}
    >
      <input
        id={inputId}
        type="number"
        placeholder={block.placeholder}
        required={block.required}
        min={block.min}
        max={block.max}
        value={value !== undefined && value !== null ? String(value) : ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? "" : Number(e.target.value))
        }
        className={inputClass}
        aria-invalid={!!error}
        disabled={readonly}
      />
    </FieldWrapper>
  );
}

// ─── Date ─────────────────────────────────────────────────────────────────────

function DateRenderer({ block, value, onChange, error, readonly }: BlockRendererProps & { block: DateBlock }) {
  const inputId = `block-${block.id}`;
  return (
    <FieldWrapper
      label={block.label}
      required={block.required}
      helpText={block.helpText}
      error={error}
      htmlFor={inputId}
    >
      <input
        id={inputId}
        type="date"
        required={block.required}
        min={block.minDate}
        max={block.maxDate}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        aria-invalid={!!error}
        disabled={readonly}
      />
    </FieldWrapper>
  );
}

// ─── Dropdown ────────────────────────────────────────────────────────────────

function DropdownRenderer({ block, value, onChange, error, readonly }: BlockRendererProps & { block: ChoiceBlock }) {
  const inputId = `block-${block.id}`;
  return (
    <FieldWrapper
      label={block.label}
      required={block.required}
      helpText={block.helpText}
      error={error}
      htmlFor={inputId}
    >
      <select
        id={inputId}
        required={block.required}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        className={[
          inputClass,
          "appearance-none cursor-pointer",
        ].join(" ")}
        aria-invalid={!!error}
        disabled={readonly}
      >
        <option value="">-- เลือก --</option>
        {block.options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}

// ─── Radio (pill buttons) ────────────────────────────────────────────────────

function RadioRenderer({ block, value, onChange, error, readonly }: BlockRendererProps & { block: ChoiceBlock }) {
  return (
    <FieldWrapper
      label={block.label}
      required={block.required}
      helpText={block.helpText}
      error={error}
    >
      <div
        className="flex flex-wrap gap-2"
        role="radiogroup"
        aria-label={block.label}
      >
        {block.options.map((opt) => {
          const selected = value === opt;
          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => !readonly && onChange(opt)}
              className={[
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500",
                "min-h-[44px]",
                readonly ? "pointer-events-none opacity-60" : "",
                selected
                  ? "bg-gradient-to-br from-green-700 to-green-500 text-white shadow-[2px_2px_6px_#1a4d24,_-1px_-1px_4px_#48b356]"
                  : "bg-[#f5f5f5] text-gray-700 shadow-[3px_3px_6px_#cecece,_-3px_-3px_6px_#ffffff] hover:shadow-[4px_4px_8px_#cecece,_-4px_-4px_8px_#ffffff]",
              ].join(" ")}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </FieldWrapper>
  );
}

// ─── Checkbox (multi-select pill buttons) ────────────────────────────────────

function CheckboxRenderer({ block, value, onChange, error, readonly }: BlockRendererProps & { block: ChoiceBlock }) {
  const selected = Array.isArray(value) ? (value as string[]) : [];

  function toggle(opt: string) {
    if (readonly) return;
    const next = selected.includes(opt)
      ? selected.filter((v) => v !== opt)
      : [...selected, opt];
    onChange(next);
  }

  return (
    <FieldWrapper
      label={block.label}
      required={block.required}
      helpText={block.helpText}
      error={error}
    >
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label={block.label}
      >
        {block.options.map((opt) => {
          const isSelected = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              aria-pressed={isSelected}
              onClick={() => toggle(opt)}
              className={[
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500",
                "min-h-[44px]",
                readonly ? "pointer-events-none opacity-60" : "",
                isSelected
                  ? "bg-gradient-to-br from-green-700 to-green-500 text-white shadow-[2px_2px_6px_#1a4d24,_-1px_-1px_4px_#48b356]"
                  : "bg-[#f5f5f5] text-gray-700 shadow-[3px_3px_6px_#cecece,_-3px_-3px_6px_#ffffff] hover:shadow-[4px_4px_8px_#cecece,_-4px_-4px_8px_#ffffff]",
              ].join(" ")}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </FieldWrapper>
  );
}

// ─── File Upload ──────────────────────────────────────────────────────────────

function FileUploadRenderer({
  block,
  value,
  onChange,
  error,
  readonly,
}: BlockRendererProps & { block: FileUploadBlock }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const file = value instanceof File ? value : null;

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const f = files[0];
    const maxBytes = block.maxSizeMb * 1024 * 1024;
    if (f.size > maxBytes) {
      // Surface error via onChange with a special marker — the page handles validation
      onChange(null);
      return;
    }
    onChange(f);
  }

  if (readonly) {
    return (
      <FieldWrapper
        label={block.label}
        required={block.required}
        helpText={block.helpText}
        error={error}
      >
        <div className="text-sm text-gray-400 italic text-center py-4">
          ไม่สามารถอัปโหลดในโหมดตัวอย่าง
        </div>
      </FieldWrapper>
    );
  }

  return (
    <FieldWrapper
      label={block.label}
      required={block.required}
      helpText={block.helpText}
      error={error}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label="อัปโหลดไฟล์"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className={[
          "flex flex-col items-center justify-center gap-2 min-h-[100px] rounded-xl",
          "border-2 border-dashed cursor-pointer transition-colors duration-150",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500",
          error
            ? "border-red-400 bg-red-50/40"
            : file
            ? "border-green-500 bg-green-50/40"
            : "border-gray-300 bg-[#f5f5f5] hover:border-green-400",
        ].join(" ")}
      >
        {file ? (
          <>
            <span className="material-symbols-rounded text-[28px] text-green-600">
              check_circle
            </span>
            <span className="text-sm text-green-700 font-medium px-4 text-center break-all">
              {file.name}
            </span>
            <span className="text-xs text-gray-400">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </>
        ) : (
          <>
            <span className="material-symbols-rounded text-[28px] text-gray-400">
              upload_file
            </span>
            <span className="text-sm text-gray-500">
              คลิกหรือลากไฟล์มาวางที่นี่
            </span>
            {block.acceptedTypes.length > 0 && (
              <span className="text-xs text-gray-400">
                รองรับ: {block.acceptedTypes.join(", ")} (สูงสุด{" "}
                {block.maxSizeMb} MB)
              </span>
            )}
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={block.acceptedTypes.join(",")}
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
        aria-hidden="true"
      />
    </FieldWrapper>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function BlockRenderer({
  block,
  value,
  onChange,
  error,
  readonly,
}: BlockRendererProps) {
  switch (block.type) {
    case "section_header":
      return <SectionHeaderRenderer block={block as SectionHeaderBlock} />;

    case "long_text":
      return (
        <LongTextRenderer
          block={block as TextBlock}
          value={value}
          onChange={onChange}
          error={error}
          readonly={readonly}
        />
      );

    case "short_text":
    case "email":
    case "phone":
      return (
        <TextRenderer
          block={block as TextBlock}
          value={value}
          onChange={onChange}
          error={error}
          readonly={readonly}
        />
      );

    case "number":
      return (
        <NumberRenderer
          block={block as NumberBlock}
          value={value}
          onChange={onChange}
          error={error}
          readonly={readonly}
        />
      );

    case "date":
      return (
        <DateRenderer
          block={block as DateBlock}
          value={value}
          onChange={onChange}
          error={error}
          readonly={readonly}
        />
      );

    case "dropdown":
      return (
        <DropdownRenderer
          block={block as ChoiceBlock}
          value={value}
          onChange={onChange}
          error={error}
          readonly={readonly}
        />
      );

    case "radio":
      return (
        <RadioRenderer
          block={block as ChoiceBlock}
          value={value}
          onChange={onChange}
          error={error}
          readonly={readonly}
        />
      );

    case "checkbox":
      return (
        <CheckboxRenderer
          block={block as ChoiceBlock}
          value={value}
          onChange={onChange}
          error={error}
          readonly={readonly}
        />
      );

    case "file_upload":
      return (
        <FileUploadRenderer
          block={block as FileUploadBlock}
          value={value}
          onChange={onChange}
          error={error}
          readonly={readonly}
        />
      );

    default:
      return null;
  }
}

export default BlockRenderer;
