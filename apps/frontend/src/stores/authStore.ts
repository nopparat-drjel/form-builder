import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/lib/types";
import api from "@/lib/api";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const { data } = await api.post<{
          accessToken: string;
          refreshToken: string;
          user: User;
        }>("/api/auth/login", { email, password });

        localStorage.setItem("refreshToken", data.refreshToken);

        set({
          user: data.user,
          accessToken: data.accessToken,
          isAuthenticated: true,
        });
      },

      logout: () => {
        localStorage.removeItem("refreshToken");
        set({ user: null, accessToken: null, isAuthenticated: false });
        // Fire-and-forget server-side logout
        api.delete("/api/auth/logout").catch(() => null);
      },

      setAccessToken: (token: string) => {
        set({ accessToken: token });
      },
    }),
    {
      name: "hr-form-auth",
      // Only persist user info, NOT the access token (short-lived)
      partialize: (state) => ({ user: state.user }),
    }
  )
);
