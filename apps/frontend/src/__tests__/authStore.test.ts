/**
 * QA gate: auth store correctly unwraps the API envelope.
 *
 * The API returns {success, data: {accessToken, refreshToken, user}}.
 * The store must read data.data.* — NOT data.* (outer object).
 * This test exists because this exact bug caused login to silently fail in prod.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act } from "react";

// ─── Mock axios instance used by authStore ────────────────────────────────────

vi.mock("@/lib/api", () => {
  const post = vi.fn();
  const del = vi.fn().mockResolvedValue({});
  const instance = { post, delete: del, interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } } };
  return { default: instance, api: instance };
});

import api from "@/lib/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MOCK_API_RESPONSE = {
  data: {
    success: true,
    data: {
      accessToken: "access-token-abc",
      refreshToken: "refresh-token-xyz",
      user: {
        id: "user-1",
        tenantId: "tenant-1",
        email: "admin@hrformkit.com",
        role: "hr_admin",
      },
    },
  },
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("authStore.login", () => {
  beforeEach(() => {
    // Reset store state between tests by reimporting
    vi.resetModules();
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("sets accessToken from data.data.accessToken (not data.accessToken)", async () => {
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(MOCK_API_RESPONSE);

    const { useAuthStore } = await import("@/stores/authStore");

    await act(async () => {
      await useAuthStore.getState().login("admin@hrformkit.com", "Admin@1234");
    });

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe("access-token-abc");
    expect(state.accessToken).not.toBeUndefined();
    expect(state.accessToken).not.toBe("undefined");
  });

  it("sets user from data.data.user", async () => {
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(MOCK_API_RESPONSE);

    const { useAuthStore } = await import("@/stores/authStore");

    await act(async () => {
      await useAuthStore.getState().login("admin@hrformkit.com", "Admin@1234");
    });

    const { user } = useAuthStore.getState();
    expect(user?.email).toBe("admin@hrformkit.com");
    expect(user?.id).toBe("user-1");
    expect(user).not.toBeUndefined();
  });

  it("stores refreshToken in localStorage from data.data.refreshToken", async () => {
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(MOCK_API_RESPONSE);

    const { useAuthStore } = await import("@/stores/authStore");

    await act(async () => {
      await useAuthStore.getState().login("admin@hrformkit.com", "Admin@1234");
    });

    expect(localStorage.getItem("refreshToken")).toBe("refresh-token-xyz");
    expect(localStorage.getItem("refreshToken")).not.toBe("undefined");
  });

  it("sets isAuthenticated to true on success", async () => {
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(MOCK_API_RESPONSE);

    const { useAuthStore } = await import("@/stores/authStore");

    await act(async () => {
      await useAuthStore.getState().login("admin@hrformkit.com", "Admin@1234");
    });

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it("throws and does not set auth state on 401", async () => {
    const axiosError = Object.assign(new Error("Unauthorized"), {
      response: { status: 401, data: { success: false, error: "Invalid credentials" } },
      isAxiosError: true,
    });
    (api.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce(axiosError);

    const { useAuthStore } = await import("@/stores/authStore");

    await expect(
      act(async () => {
        await useAuthStore.getState().login("wrong@example.com", "badpassword");
      })
    ).rejects.toThrow();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
  });

  it("calls POST /api/auth/login with correct payload", async () => {
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(MOCK_API_RESPONSE);

    const { useAuthStore } = await import("@/stores/authStore");

    await act(async () => {
      await useAuthStore.getState().login("admin@hrformkit.com", "Admin@1234");
    });

    expect(api.post).toHaveBeenCalledWith("/api/auth/login", {
      email: "admin@hrformkit.com",
      password: "Admin@1234",
    });
  });
});
