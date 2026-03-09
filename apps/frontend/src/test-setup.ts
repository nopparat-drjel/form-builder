import "@testing-library/react";
import { vi } from "vitest";

// Extend global fetch for test environment
(globalThis as typeof globalThis & { fetch: unknown }).fetch = vi.fn();

// Suppress console.error for known React warnings in tests
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  if (
    typeof args[0] === "string" &&
    (args[0].includes("ReactDOM.render") ||
      args[0].includes("act(...)"))
  ) {
    return;
  }
  originalConsoleError(...args);
};
