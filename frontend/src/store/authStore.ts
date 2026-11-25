import { create } from "zustand";
import { User } from "@/types/auth";
import { api } from "@/lib/api";

const safeStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === "undefined" || typeof localStorage === "undefined") return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === "undefined" || typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(key, value);
    } catch {
      // Ignore quota or permission errors
    }
  },
  removeItem: (key: string): void => {
    if (typeof window === "undefined" || typeof localStorage === "undefined") return;
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore storage errors
    }
  },
};

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (token: string, user: User) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (token: string, user: User) => {
    safeStorage.setItem("roomsketch_token", token);
    safeStorage.setItem("roomsketch_user", JSON.stringify(user));
    set({ token, user, isAuthenticated: true, isLoading: false });
  },

  updateUser: (updatedFields: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      const merged = { ...currentUser, ...updatedFields };
      safeStorage.setItem("roomsketch_user", JSON.stringify(merged));
      set({ user: merged });
    }
  },

  logout: () => {
    safeStorage.removeItem("roomsketch_token");
    safeStorage.removeItem("roomsketch_user");
    set({ token: null, user: null, isAuthenticated: false, isLoading: false });
  },

  initAuth: async () => {
    const token = safeStorage.getItem("roomsketch_token");
    const storedUser = safeStorage.getItem("roomsketch_user");

    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null, token: null });
      return;
    }

    try {
      if (storedUser) {
        set({ user: JSON.parse(storedUser), token, isAuthenticated: true });
      }

      const res = await api.get("/users/me");
      if (res.data.success) {
        const freshUser: User = res.data.data;
        safeStorage.setItem("roomsketch_user", JSON.stringify(freshUser));
        set({ user: freshUser, token, isAuthenticated: true, isLoading: false });
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } };
      // Only wipe session if the server explicitly rejected the token as unauthorized (401)
      if (axiosErr.response?.status === 401) {
        safeStorage.removeItem("roomsketch_token");
        safeStorage.removeItem("roomsketch_user");
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      } else {
        // If the server returned 502/503 (waking up from standby) or a temporary network glitch,
        // preserve the authenticated session from local cache so the user is not abruptly kicked out
        if (storedUser) {
          try {
            set({ user: JSON.parse(storedUser), token, isAuthenticated: true, isLoading: false });
          } catch {
            set({ isLoading: false });
          }
        } else {
          set({ isLoading: false });
        }
      }
    }
  },
}));
