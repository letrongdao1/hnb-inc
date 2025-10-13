import { create } from "zustand";

interface AppState {
  user: { id: string; email: string } | null;
  theme: "light" | "dark";
  loading: boolean;
  setUser: (user: AppState["user"]) => void;
  setTheme: (theme: "light" | "dark") => void;
  setLoading: (state: boolean) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  theme: "dark",
  loading: false,
  setUser: (user) => set({ user }),
  setTheme: (theme) => set({ theme }),
  setLoading: (state) => set({ loading: state }),
  reset: () => set({ user: null, theme: "dark", loading: false }),
}));
