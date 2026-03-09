import { useReducer, useCallback } from "react";
import type { Block, BlockType } from "@/lib/types";

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: "ADD_BLOCK"; payload: { blockType: BlockType } }
  | { type: "DELETE_BLOCK"; payload: { id: string } }
  | { type: "REORDER_BLOCKS"; payload: { fromIndex: number; toIndex: number } }
  | { type: "UPDATE_BLOCK"; payload: { id: string; patch: Partial<Block> } }
  | { type: "SET_BLOCKS"; payload: { blocks: Block[] } };

// ─── Default block factory ────────────────────────────────────────────────────

function createDefaultBlock(type: BlockType, order: number): Block {
  const base = {
    id: crypto.randomUUID(),
    label: "ชื่อฟิลด์",
    required: false,
    order,
  };

  switch (type) {
    case "short_text":
    case "long_text":
    case "email":
    case "phone":
      return { ...base, type, placeholder: "" };

    case "number":
      return { ...base, type, placeholder: "" };

    case "date":
      return { ...base, type };

    case "dropdown":
    case "radio":
    case "checkbox":
      return { ...base, type, options: ["ตัวเลือก 1", "ตัวเลือก 2"] };

    case "file_upload":
      return {
        ...base,
        type,
        acceptedTypes: ["application/pdf", "image/*"],
        maxSizeMb: 5,
      };

    case "section_header":
      return { ...base, type, label: "หัวข้อส่วน" };

    default: {
      const _exhaustive: never = type;
      throw new Error(`Unknown block type: ${_exhaustive}`);
    }
  }
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: Block[], action: Action): Block[] {
  switch (action.type) {
    case "ADD_BLOCK": {
      const newBlock = createDefaultBlock(
        action.payload.blockType,
        state.length
      );
      return [...state, newBlock];
    }

    case "DELETE_BLOCK":
      return state
        .filter((b) => b.id !== action.payload.id)
        .map((b, i) => ({ ...b, order: i }));

    case "REORDER_BLOCKS": {
      const { fromIndex, toIndex } = action.payload;
      const next = [...state];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next.map((b, i) => ({ ...b, order: i }));
    }

    case "UPDATE_BLOCK":
      return state.map((b) =>
        b.id === action.payload.id
          ? ({ ...b, ...action.payload.patch } as Block)
          : b
      );

    case "SET_BLOCKS":
      return action.payload.blocks;

    default:
      return state;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useFormBuilder(initialBlocks: Block[] = []) {
  const [blocks, dispatch] = useReducer(reducer, initialBlocks);

  const addBlock = useCallback((blockType: BlockType) => {
    dispatch({ type: "ADD_BLOCK", payload: { blockType } });
  }, []);

  const deleteBlock = useCallback((id: string) => {
    dispatch({ type: "DELETE_BLOCK", payload: { id } });
  }, []);

  const reorderBlocks = useCallback((fromIndex: number, toIndex: number) => {
    dispatch({ type: "REORDER_BLOCKS", payload: { fromIndex, toIndex } });
  }, []);

  const updateBlock = useCallback((id: string, patch: Partial<Block>) => {
    dispatch({ type: "UPDATE_BLOCK", payload: { id, patch } });
  }, []);

  const setBlocks = useCallback((blocks: Block[]) => {
    dispatch({ type: "SET_BLOCKS", payload: { blocks } });
  }, []);

  return { blocks, addBlock, deleteBlock, reorderBlocks, updateBlock, setBlocks };
}
