import { create } from "zustand";
import { User } from "@/types/auth";
import { api } from "@/lib/api";

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
    localStorage.setItem("roomsketch_token", token);
    localStorage.setItem("roomsketch_user", JSON.stringify(user));
    set({ token, user, isAuthenticated: true, isLoading: false });
  },

  updateUser: (updatedFields: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      const merged = { ...currentUser, ...updatedFields };
      localStorage.setItem("roomsketch_user", JSON.stringify(merged));
      set({ user: merged });
    }
  },

  logout: () => {
    localStorage.removeItem("roomsketch_token");
    localStorage.removeItem("roomsketch_user");
    set({ token: null, user: null, isAuthenticated: false, isLoading: false });
  },

  initAuth: async () => {
    if (typeof window === "undefined") {
      set({ isLoading: false });
      return;
    }

    const token = localStorage.getItem("roomsketch_token");
    const storedUser = localStorage.getItem("roomsketch_user");

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
        localStorage.setItem("roomsketch_user", JSON.stringify(freshUser));
        set({ user: freshUser, token, isAuthenticated: true, isLoading: false });
      }
    } catch {
      localStorage.removeItem("roomsketch_token");
      localStorage.removeItem("roomsketch_user");
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
