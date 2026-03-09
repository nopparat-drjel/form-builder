import { create } from "zustand";
import type { Form } from "@/lib/types";

interface FormState {
  forms: Form[];
  activeFormId: string | null;

  // Actions
  setForms: (forms: Form[]) => void;
  updateForm: (id: string, patch: Partial<Form>) => void;
  addForm: (form: Form) => void;
  removeForm: (id: string) => void;
  setActiveFormId: (id: string | null) => void;
}

export const useFormStore = create<FormState>((set) => ({
  forms: [],
  activeFormId: null,

  setForms: (forms) => set({ forms }),

  updateForm: (id, patch) =>
    set((state) => ({
      forms: state.forms.map((f) =>
        f.id === id ? { ...f, ...patch, updatedAt: Date.now() } : f
      ),
    })),

  addForm: (form) =>
    set((state) => ({
      forms: [form, ...state.forms],
    })),

  removeForm: (id) =>
    set((state) => ({
      forms: state.forms.filter((f) => f.id !== id),
      activeFormId: state.activeFormId === id ? null : state.activeFormId,
    })),

  setActiveFormId: (id) => set({ activeFormId: id }),
}));
