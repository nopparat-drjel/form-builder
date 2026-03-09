import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import toast from "react-hot-toast";

import { fetchForm, updateForm } from "@/lib/forms";
import { useFormBuilder } from "@/hooks/useFormBuilder";
import type { Block, BlockType } from "@/lib/types";
import { NeuButton } from "@/components/ui/NeuButton";
import { I } from "@/components/ui/Icon";
import BlockItem from "@/components/builder/BlockItem";
import BlockSettings from "@/components/builder/BlockSettings";
import LogoUpload from "@/components/builder/LogoUpload";
import ShareModal from "@/components/ShareModal";

// ─── Block palette config ─────────────────────────────────────────────────────

interface PaletteItem {
  type: BlockType;
  icon: string;
  label: string;
  sublabel: string;
}

const PALETTE_SECTIONS: Array<{ heading: string; items: PaletteItem[] }> = [
  {
    heading: "เนื้อหา",
    items: [
      { type: "section_header", icon: "title", label: "หัวข้อส่วน", sublabel: "Section Header" },
    ],
  },
  {
    heading: "ช่องกรอก",
    items: [
      { type: "short_text", icon: "short_text", label: "ข้อความสั้น", sublabel: "Short Text" },
      { type: "long_text", icon: "notes", label: "ข้อความยาว", sublabel: "Long Text" },
      { type: "number", icon: "numbers", label: "ตัวเลข", sublabel: "Number" },
      { type: "email", icon: "mail", label: "อีเมล", sublabel: "Email" },
      { type: "phone", icon: "phone", label: "เบอร์โทร", sublabel: "Phone" },
      { type: "date", icon: "calendar_today", label: "วันที่", sublabel: "Date" },
    ],
  },
  {
    heading: "ตัวเลือก",
    items: [
      { type: "dropdown", icon: "arrow_drop_down_circle", label: "Dropdown", sublabel: "Select list" },
      { type: "radio", icon: "radio_button_checked", label: "Radio", sublabel: "Single choice" },
      { type: "checkbox", icon: "check_box", label: "Checkbox", sublabel: "Multiple choice" },
    ],
  },
  {
    heading: "ไฟล์",
    items: [
      { type: "file_upload", icon: "upload_file", label: "อัปโหลดไฟล์", sublabel: "File Upload" },
    ],
  },
];

// ─── Save status indicator ────────────────────────────────────────────────────

type SaveStatus = "idle" | "saving" | "saved" | "error";

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  return (
    <div className="flex items-center gap-1.5 text-xs">
      {status === "saving" && (
        <>
          <I name="progress_activity" size={14} className="text-gray-400 animate-spin" />
          <span className="text-gray-400">กำลังบันทึก...</span>
        </>
      )}
      {status === "saved" && (
        <>
          <I name="check_circle" size={14} className="text-green-600" />
          <span className="text-green-600">บันทึกแล้ว</span>
        </>
      )}
      {status === "error" && (
        <>
          <I name="error" size={14} className="text-red-500" />
          <span className="text-red-500">บันทึกไม่สำเร็จ</span>
        </>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BuilderPage() {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Local title/description/logo state (editable in header / settings panel)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [titleEditing, setTitleEditing] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasInitialized = useRef(false);

  const { blocks, addBlock, deleteBlock, reorderBlocks, updateBlock, setBlocks } =
    useFormBuilder();

  // ── Fetch form ──────────────────────────────────────────────────────────────

  const { data: form, isLoading, isError } = useQuery({
    queryKey: ["form", formId],
    queryFn: () => fetchForm(formId!),
    enabled: !!formId,
  });

  // Initialize blocks + title on first load
  useEffect(() => {
    if (form && !hasInitialized.current) {
      setBlocks(form.blocks);
      setTitle(form.title);
      setDescription(form.description ?? "");
      setLogoUrl(form.logoUrl);
      hasInitialized.current = true;
    }
  }, [form, setBlocks]);

  // ── Save mutation ───────────────────────────────────────────────────────────

  const { mutate: doSave } = useMutation({
    mutationFn: () =>
      updateForm(formId!, {
        title,
        description: description || undefined,
        logoUrl: logoUrl ?? undefined,
        blocks,
      }),
    onMutate: () => setSaveStatus("saving"),
    onSuccess: () => {
      setSaveStatus("saved");
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      setTimeout(() => setSaveStatus("idle"), 2500);
    },
    onError: () => {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    },
  });

  // ── Auto-save (debounced 1.5 s after any block/title/desc change) ───────────

  const triggerAutoSave = useCallback(() => {
    if (!hasInitialized.current) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      doSave();
    }, 1500);
  }, [doSave]);

  // Watch blocks for changes
  const blocksRef = useRef(blocks);
  useEffect(() => {
    if (!hasInitialized.current) return;
    if (blocksRef.current !== blocks) {
      blocksRef.current = blocks;
      triggerAutoSave();
    }
  }, [blocks, triggerAutoSave]);

  // ── DnD setup ──────────────────────────────────────────────────────────────

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = blocks.findIndex((b) => b.id === active.id);
    const toIndex = blocks.findIndex((b) => b.id === over.id);
    if (fromIndex !== -1 && toIndex !== -1) {
      reorderBlocks(fromIndex, toIndex);
    }
  }

  // ── Selected block ─────────────────────────────────────────────────────────

  const selectedBlock = blocks.find((b) => b.id === selectedId) ?? null;

  function handleUpdateBlock(id: string, patch: Partial<Block>) {
    updateBlock(id, patch);
  }

  // ── Manual save ────────────────────────────────────────────────────────────

  function handleSave() {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    doSave();
  }

  // ── Loading / error states ─────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-140px)]">
        <div className="flex items-center gap-3 text-gray-400">
          <I name="progress_activity" size={24} className="animate-spin" />
          <span className="text-sm">กำลังโหลดแบบฟอร์ม...</span>
        </div>
      </div>
    );
  }

  if (isError || !form) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] gap-4">
        <I name="error" size={40} className="text-red-400" />
        <p className="text-sm text-gray-500">ไม่พบแบบฟอร์มนี้</p>
        <NeuButton variant="default" onClick={() => navigate("/forms")}>
          กลับไปรายการ
        </NeuButton>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Header bar ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <NeuButton
          variant="ghost"
          size="sm"
          icon="arrow_back"
          onClick={() => navigate("/forms")}
          aria-label="กลับ"
        />

        {/* Editable title */}
        <div className="flex-1 min-w-0">
          {titleEditing ? (
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                setTitleEditing(false);
                triggerAutoSave();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setTitleEditing(false);
                  triggerAutoSave();
                }
              }}
              className="bg-[#f5f5f5] text-green-900 font-semibold font-prompt text-lg rounded-lg px-2 py-0.5 shadow-neu-in-sm border border-green-500 focus:outline-none w-full max-w-xs"
            />
          ) : (
            <button
              onClick={() => setTitleEditing(true)}
              className="text-lg font-semibold text-green-900 font-prompt hover:bg-gray-200/50 rounded-lg px-2 py-0.5 transition-colors text-left truncate max-w-xs"
              title="คลิกเพื่อแก้ไขชื่อ"
            >
              {title || "ไม่มีชื่อ"}
            </button>
          )}
        </div>

        <SaveIndicator status={saveStatus} />

        <NeuButton
          variant="default"
          size="sm"
          icon="visibility"
          onClick={() => navigate(`/forms/${formId}/preview`)}
        >
          ดูตัวอย่าง
        </NeuButton>
        <NeuButton
          variant="default"
          size="sm"
          icon="share"
          onClick={() => setShowShare(true)}
        >
          แชร์
        </NeuButton>
        <NeuButton
          variant="primary"
          size="sm"
          icon="save"
          onClick={handleSave}
          loading={saveStatus === "saving"}
        >
          บันทึก
        </NeuButton>
      </div>

      {/* ── 3-panel grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-[260px_1fr_280px] gap-4 h-[calc(100vh-140px)]">

        {/* ── LEFT: Block Palette ───────────────────────────────────────── */}
        <div className="bg-[#f5f5f5] rounded-2xl shadow-neu-sm overflow-y-auto">
          <div className="p-3 space-y-4">
            {PALETTE_SECTIONS.map((section) => (
              <div key={section.heading}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
                  {section.heading}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <button
                      key={item.type}
                      onClick={() => {
                        addBlock(item.type);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left group hover:shadow-neu-xs active:shadow-neu-in-sm min-h-[44px]"
                    >
                      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-colors">
                        <I name={item.icon} size={18} className="text-green-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-700 leading-tight">
                          {item.label}
                        </p>
                        <p className="text-xs text-gray-400 leading-tight">
                          {item.sublabel}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CENTER: Canvas ────────────────────────────────────────────── */}
        <div className="bg-[#f5f5f5] rounded-2xl shadow-neu-in flex flex-col overflow-hidden">
          {/* Canvas header — form title + description */}
          <div className="px-5 pt-5 pb-4 border-b border-gray-200/60 shrink-0">
            <h2 className="text-xl font-bold text-green-900 font-prompt">
              {title || "ไม่มีชื่อ"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {description || (
                <span className="italic text-gray-300">ไม่มีคำอธิบาย</span>
              )}
            </p>
          </div>

          {/* Block list */}
          <div className="flex-1 overflow-y-auto p-4">
            {blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center mb-4">
                  <I name="drag_indicator" size={28} className="text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-400">
                  คลิกฟิลด์ทางซ้ายเพื่อเพิ่ม
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  ลากเพื่อจัดเรียงลำดับฟิลด์
                </p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={blocks.map((b) => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {blocks.map((block) => (
                      <BlockItem
                        key={block.id}
                        block={block}
                        isSelected={selectedId === block.id}
                        onSelect={() => setSelectedId(block.id)}
                        onDelete={() => {
                          deleteBlock(block.id);
                          if (selectedId === block.id) setSelectedId(null);
                        }}
                        onLabelChange={(label) =>
                          handleUpdateBlock(block.id, { label } as Partial<Block>)
                        }
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* Canvas footer */}
          <div className="px-4 py-3 border-t border-gray-200/60 shrink-0 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {blocks.length} ฟิลด์
            </span>
            <NeuButton
              variant="default"
              size="sm"
              icon="add"
              onClick={() => addBlock("short_text")}
            >
              เพิ่มฟิลด์
            </NeuButton>
          </div>
        </div>

        {/* ── RIGHT: Settings Panel ─────────────────────────────────────── */}
        <div className="bg-[#f5f5f5] rounded-2xl shadow-neu-sm overflow-y-auto">
          {selectedBlock ? (
            <div className="p-4">
              {/* Settings panel header */}
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm font-semibold text-green-900 font-prompt">
                  ตั้งค่าฟิลด์
                </p>
                <button
                  onClick={() => setSelectedId(null)}
                  className="p-1 rounded-lg hover:bg-gray-200/60 transition-colors"
                  aria-label="ปิดแผงตั้งค่า"
                >
                  <I name="close" size={18} className="text-gray-400" />
                </button>
              </div>

              <BlockSettings
                block={selectedBlock}
                onChange={(patch) => handleUpdateBlock(selectedBlock.id, patch)}
              />
            </div>
          ) : (
            /* Form settings panel — shown when no block is selected */
            <div className="p-4 space-y-5">
              <p className="text-sm font-semibold text-green-900 font-prompt">
                ตั้งค่าฟอร์ม
              </p>

              {/* Form description */}
              <div className="space-y-1.5">
                <label
                  htmlFor="form-description"
                  className="text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  คำอธิบาย
                </label>
                <textarea
                  id="form-description"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    triggerAutoSave();
                  }}
                  placeholder="อธิบายแบบฟอร์มนี้ (ไม่บังคับ)"
                  rows={3}
                  className="w-full text-sm rounded-xl px-3 py-2.5
                    bg-[#f5f5f5] shadow-neu-in-sm border border-transparent
                    focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500
                    placeholder:text-gray-300 text-gray-700
                    transition-all duration-150 resize-none"
                />
              </div>

              {/* Logo upload */}
              <LogoUpload
                logoUrl={logoUrl}
                onLogoChange={(dataUrl) => {
                  setLogoUrl(dataUrl ?? undefined);
                  triggerAutoSave();
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Share modal ───────────────────────────────────────────────────── */}
      {showShare && (
        <ShareModal
          formId={formId!}
          formTitle={title}
          onClose={() => setShowShare(false)}
        />
      )}
    </>
  );
}
