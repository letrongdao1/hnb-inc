import { create } from "zustand";

interface AppState {
  isAuthenticated: boolean;
  user: { id: string; email: string } | null;
  theme: "light" | "dark";
  loading: boolean;
  setAuthenticated: (state: boolean) => void;
  setUser: (user: AppState["user"]) => void;
  setTheme: (theme: "light" | "dark") => void;
  setLoading: (state: boolean) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  user: null,
  theme: "dark",
  loading: false,
  setAuthenticated: (state) => set({ isAuthenticated: state }),
  setUser: (user) => set({ user }),
  setTheme: (theme) => set({ theme }),
  setLoading: (state) => set({ loading: state }),
  reset: () => set({ user: null, theme: "dark", loading: false }),
}));
