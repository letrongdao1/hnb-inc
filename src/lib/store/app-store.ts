import { createStore } from "zustand/vanilla";
import { UserInfo } from "@/interfaces/user";

export type AppState = {
  isAuthenticated: boolean;
  user: UserInfo | null;
  loading: boolean;
};

export type AppActions = {
  setAuthenticated: (v: boolean) => void;
  setUser: (user: UserInfo | null) => void;
  setLoading: (v: boolean) => void;
};

export type AppStore = AppState & AppActions;

export const defaultInitState: AppState = {
  isAuthenticated: false,
  user: null,
  loading: false,
};

export const createAppStore = (initState: AppState = defaultInitState) => {
  return createStore<AppStore>()((set) => ({
    ...initState,
    setAuthenticated: () => set(({ isAuthenticated }: AppStore) => ({ isAuthenticated })),
    setUser: () => set(({ user }: AppStore) => ({ user })),
    setLoading: () => set(({ loading }: AppStore) => ({ loading })),
  }));
};
