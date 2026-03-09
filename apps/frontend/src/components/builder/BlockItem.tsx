import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Block } from "@/lib/types";
import { I } from "@/components/ui/Icon";

// ─── Block type metadata ──────────────────────────────────────────────────────

const BLOCK_META: Record<Block["type"], { icon: string; label: string }> = {
  short_text: { icon: "short_text", label: "ข้อความสั้น" },
  long_text: { icon: "notes", label: "ข้อความยาว" },
  number: { icon: "numbers", label: "ตัวเลข" },
  email: { icon: "mail", label: "อีเมล" },
  phone: { icon: "phone", label: "เบอร์โทร" },
  date: { icon: "calendar_today", label: "วันที่" },
  dropdown: { icon: "arrow_drop_down_circle", label: "Dropdown" },
  radio: { icon: "radio_button_checked", label: "Radio" },
  checkbox: { icon: "check_box", label: "Checkbox" },
  file_upload: { icon: "upload_file", label: "อัปโหลดไฟล์" },
  section_header: { icon: "title", label: "หัวข้อส่วน" },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface BlockItemProps {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onLabelChange: (label: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BlockItem({
  block,
  isSelected,
  onSelect,
  onDelete,
  onLabelChange,
}: BlockItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const meta = BLOCK_META[block.type];

  function handleLabelKeyDown(e: React.KeyboardEvent<HTMLSpanElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      (e.target as HTMLSpanElement).blur();
    }
  }

  function handleLabelBlur(e: React.FocusEvent<HTMLSpanElement>) {
    const newLabel = e.target.textContent?.trim() ?? "";
    if (newLabel && newLabel !== block.label) {
      onLabelChange(newLabel);
    } else {
      // Restore original if empty
      e.target.textContent = block.label;
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={[
        "group flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer",
        "transition-all duration-150 select-none",
        "border-l-4",
        isSelected
          ? "border-green-500 bg-green-50/40 shadow-neu-xs ring-2 ring-green-500/30"
          : "border-transparent bg-[#f5f5f5] shadow-neu-xs hover:shadow-neu-sm",
      ].join(" ")}
      role="option"
      aria-selected={isSelected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="shrink-0 p-1 -ml-1 rounded-lg cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors touch-none"
        aria-label="ลากเพื่อจัดเรียง"
        tabIndex={-1}
      >
        <I name="drag_indicator" size={20} />
      </button>

      {/* Block type icon */}
      <div className="shrink-0 w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
        <I name={meta.icon} size={18} className="text-green-700" />
      </div>

      {/* Label — inline editable */}
      <div className="flex-1 min-w-0">
        <span
          contentEditable
          suppressContentEditableWarning
          onKeyDown={handleLabelKeyDown}
          onBlur={handleLabelBlur}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className={[
            "block text-sm font-medium truncate max-w-full outline-none",
            "rounded px-0.5 -mx-0.5",
            "focus:bg-white/60 focus:ring-1 focus:ring-green-400",
            isSelected ? "text-green-900" : "text-gray-700",
          ].join(" ")}
          title="คลิกเพื่อแก้ไขชื่อ"
        >
          {block.label}
        </span>
        <span className="text-xs text-gray-400">{meta.label}</span>
      </div>

      {/* Required dot */}
      {block.required && (
        <div
          className="shrink-0 w-2 h-2 rounded-full bg-red-500"
          title="จำเป็นต้องกรอก"
          aria-label="required"
        />
      )}

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className={[
          "shrink-0 p-1.5 rounded-lg transition-all duration-150",
          "text-gray-300 hover:text-red-500 hover:bg-red-50",
          "opacity-0 group-hover:opacity-100 focus:opacity-100",
          "min-w-[36px] min-h-[36px] flex items-center justify-center",
        ].join(" ")}
        aria-label="ลบฟิลด์"
      >
        <I name="delete" size={18} />
      </button>
    </div>
  );
}

export default BlockItem;
