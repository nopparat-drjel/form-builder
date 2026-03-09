import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { fetchForms, createForm, deleteForm, updateForm } from "@/lib/forms";
import type { Form } from "@/lib/types";
import NeuButton from "@/components/ui/NeuButton";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuInput } from "@/components/ui/NeuInput";
import { Toggle } from "@/components/ui/Toggle";
import { I } from "@/components/ui/Icon";

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-[#f5f5f5] rounded-2xl shadow-neu-sm p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="h-5 w-12 bg-gray-200 rounded-full ml-3" />
      </div>
      <div className="flex items-center gap-3 pt-3 border-t border-gray-200/60">
        <div className="h-3 bg-gray-200 rounded w-16" />
        <div className="h-3 bg-gray-200 rounded w-20" />
      </div>
      <div className="flex gap-2 mt-4">
        <div className="h-8 bg-gray-200 rounded-xl flex-1" />
        <div className="h-8 bg-gray-200 rounded-xl w-8" />
      </div>
    </div>
  );
}

// ─── New form modal ───────────────────────────────────────────────────────────

interface NewFormModalProps {
  onClose: () => void;
}

function NewFormModal({ onClose }: NewFormModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => createForm({ title: title.trim(), description: description.trim() || undefined }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      toast.success("สร้างแบบฟอร์มเรียบร้อย");
      onClose();
      navigate(`/forms/${data.id}/edit`);
    },
    onError: () => {
      toast.error("ไม่สามารถสร้างแบบฟอร์มได้ กรุณาลองใหม่อีกครั้ง");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    mutate();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-form-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card */}
      <NeuCard elevation="raised" className="relative z-10 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h2
            id="new-form-modal-title"
            className="text-lg font-semibold text-green-900 font-prompt"
          >
            สร้างแบบฟอร์มใหม่
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-200/60 transition-colors"
            aria-label="ปิด"
          >
            <I name="close" size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <NeuInput
            label="ชื่อแบบฟอร์ม"
            placeholder="เช่น ใบสมัครงาน 2025"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              คำอธิบาย <span className="text-gray-400 font-normal">(ไม่บังคับ)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="อธิบายวัตถุประสงค์ของแบบฟอร์มนี้..."
              rows={3}
              className="w-full bg-[#f5f5f5] text-gray-800 text-sm rounded-xl px-4 py-2.5 shadow-neu-in-sm border border-transparent focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 placeholder:text-gray-400 transition-all duration-150 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <NeuButton
              type="button"
              variant="default"
              className="flex-1"
              onClick={onClose}
              disabled={isPending}
            >
              ยกเลิก
            </NeuButton>
            <NeuButton
              type="submit"
              variant="primary"
              className="flex-1"
              loading={isPending}
              disabled={!title.trim()}
              icon="add"
            >
              สร้างแบบฟอร์ม
            </NeuButton>
          </div>
        </form>
      </NeuCard>
    </div>
  );
}

// ─── Delete confirm dialog ────────────────────────────────────────────────────

interface DeleteDialogProps {
  form: Form;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}

function DeleteDialog({ form, onConfirm, onCancel, isPending }: DeleteDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onCancel}
      />
      <NeuCard elevation="raised" className="relative z-10 w-full max-w-sm text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
            <I name="delete" size={24} className="text-red-500" />
          </div>
        </div>
        <h2
          id="delete-dialog-title"
          className="text-base font-semibold text-gray-800 mb-2 font-prompt"
        >
          ลบแบบฟอร์ม?
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          ต้องการลบ "<span className="font-medium text-gray-700">{form.title}</span>" ใช่หรือไม่?
          การกระทำนี้ไม่สามารถย้อนกลับได้
        </p>
        <div className="flex gap-3">
          <NeuButton
            variant="default"
            className="flex-1"
            onClick={onCancel}
            disabled={isPending}
          >
            ยกเลิก
          </NeuButton>
          <NeuButton
            variant="danger"
            className="flex-1"
            onClick={onConfirm}
            loading={isPending}
            icon="delete"
          >
            ลบ
          </NeuButton>
        </div>
      </NeuCard>
    </div>
  );
}

// ─── Form card ────────────────────────────────────────────────────────────────

interface FormCardProps {
  form: Form;
  onDelete: (form: Form) => void;
  onToggleActive: (form: Form) => void;
  isTogglingActive: boolean;
}

function FormCard({ form, onDelete, onToggleActive, isTogglingActive }: FormCardProps) {
  const navigate = useNavigate();

  const updatedDate = new Date(form.updatedAt * 1000).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <NeuCard elevation="raised" className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-green-900 font-prompt truncate">
            {form.title}
          </h3>
          {form.description && (
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
              {form.description}
            </p>
          )}
        </div>
        <span
          className={[
            "shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
            form.active
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-500",
          ].join(" ")}
        >
          {form.active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-400 border-t border-gray-200/60 pt-3">
        <span className="flex items-center gap-1">
          <I name="view_module" size={14} />
          {form.blocks.length} ฟิลด์
        </span>
        <span className="flex items-center gap-1">
          <I name="schedule" size={14} />
          {updatedDate}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-gray-400">เปิดรับ</span>
          <Toggle
            checked={form.active}
            onChange={() => onToggleActive(form)}
            disabled={isTogglingActive}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <NeuButton
          variant="primary"
          size="sm"
          icon="edit"
          className="flex-1 min-h-[44px]"
          onClick={() => navigate(`/forms/${form.id}/edit`)}
        >
          แก้ไข
        </NeuButton>
        <NeuButton
          variant="default"
          size="sm"
          icon="delete"
          className="min-h-[44px] min-w-[44px]"
          onClick={() => onDelete(form)}
          aria-label="ลบแบบฟอร์ม"
        />
      </div>
    </NeuCard>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function FormsPage() {
  const [showNewModal, setShowNewModal] = useState(false);
  const [deletingForm, setDeletingForm] = useState<Form | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["forms"],
    queryFn: fetchForms,
  });

  const { mutate: doDelete, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteForm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      toast.success("ลบแบบฟอร์มเรียบร้อย");
      setDeletingForm(null);
    },
    onError: () => {
      toast.error("ไม่สามารถลบแบบฟอร์มได้ กรุณาลองใหม่อีกครั้ง");
    },
  });

  const { mutate: doToggleActive } = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      updateForm(id, { active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
    },
    onError: () => {
      toast.error("ไม่สามารถเปลี่ยนสถานะได้ กรุณาลองใหม่อีกครั้ง");
    },
    onSettled: () => {
      setTogglingId(null);
    },
  });

  function handleToggleActive(form: Form) {
    setTogglingId(form.id);
    doToggleActive({ id: form.id, active: !form.active });
  }

  const forms = data?.forms ?? [];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-green-900 font-prompt">แบบฟอร์ม</h1>
            <p className="text-sm text-gray-500 mt-1">จัดการแบบฟอร์มรับสมัครงาน</p>
          </div>
          <NeuButton
            variant="primary"
            icon="add"
            onClick={() => setShowNewModal(true)}
          >
            สร้างแบบฟอร์มใหม่
          </NeuButton>
        </div>

        {/* Loading skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && (
          <NeuCard elevation="flat">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-50 shadow-neu-in flex items-center justify-center mb-4">
                <I name="error" size={28} className="text-red-400" />
              </div>
              <p className="text-sm text-gray-500">ไม่สามารถโหลดข้อมูลได้ กรุณารีเฟรชหน้า</p>
            </div>
          </NeuCard>
        )}

        {/* Empty state */}
        {!isLoading && !isError && forms.length === 0 && (
          <NeuCard>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-green-50 shadow-neu-in flex items-center justify-center mb-4">
                <I name="description" size={32} className="text-green-300" />
              </div>
              <h3 className="text-base font-medium text-gray-600 mb-1 font-prompt">
                ยังไม่มีแบบฟอร์ม
              </h3>
              <p className="text-sm text-gray-400 max-w-xs">
                สร้างแบบฟอร์มแรกของคุณเพื่อเริ่มรับใบสมัครออนไลน์
              </p>
              <NeuButton
                variant="primary"
                icon="add"
                className="mt-6"
                onClick={() => setShowNewModal(true)}
              >
                สร้างแบบฟอร์มใหม่
              </NeuButton>
            </div>
          </NeuCard>
        )}

        {/* Form grid */}
        {!isLoading && !isError && forms.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {forms.map((form) => (
              <FormCard
                key={form.id}
                form={form}
                onDelete={setDeletingForm}
                onToggleActive={handleToggleActive}
                isTogglingActive={togglingId === form.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showNewModal && (
        <NewFormModal onClose={() => setShowNewModal(false)} />
      )}

      {deletingForm && (
        <DeleteDialog
          form={deletingForm}
          onConfirm={() => doDelete(deletingForm.id)}
          onCancel={() => setDeletingForm(null)}
          isPending={isDeleting}
        />
      )}
    </>
  );
}
