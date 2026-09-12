import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, Role } from "@/types";
import {
  login as apiLogin,
  signup as apiSignup,
  getMe as apiGetMe,
  googleLogin as apiGoogleLogin,
} from "@/lib/api";

interface SessionState {
  currentUser: User | null;
  token: string | null;
  isLoading: boolean;
  isValidating: boolean;
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: (data: {
    email: string;
    name: string;
    role?: Role;
    orgName?: string;
    googleId?: string;
  }) => Promise<User>;
  signup: (data: {
    email: string;
    name: string;
    password: string;
    role: Role;
    orgName?: string;
  }) => Promise<{ success: boolean; message: string; user: User }>;
  validateSession: () => Promise<boolean>;
  logout: () => void;
  switchRole: (role: Role) => void;
  setUser: (user: User, token?: string) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      token: null,
      isLoading: false,
      isValidating: false,
      hasHydrated: false,

      setHasHydrated: (state: boolean) => set({ hasHydrated: state }),

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const res = await apiLogin(email, password);
          set({
            currentUser: res.user,
            token: res.token,
            isLoading: false,
          });
          return res.user;
        } catch (err) {
          set({
            currentUser: null,
            token: null,
            isLoading: false,
          });
          throw err;
        }
      },

      loginWithGoogle: async (data: {
        email: string;
        name: string;
        role?: Role;
        orgName?: string;
        googleId?: string;
      }) => {
        set({ isLoading: true });
        try {
          const res = await apiGoogleLogin(data);
          set({
            currentUser: res.user,
            token: res.token,
            isLoading: false,
          });
          return res.user;
        } catch (err) {
          set({
            currentUser: null,
            token: null,
            isLoading: false,
          });
          throw err;
        }
      },

      signup: async (data: {
        email: string;
        name: string;
        password: string;
        role: Role;
        orgName?: string;
      }) => {
        set({ isLoading: true });
        try {
          const res = await apiSignup(data);
          set({ isLoading: false });
          return res;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      validateSession: async () => {
        const token = get().token;
        if (!token) {
          set({ currentUser: null, token: null, isValidating: false });
          return false;
        }

        set({ isValidating: true });
        try {
          const verifiedUser = await apiGetMe();
          set({
            currentUser: verifiedUser,
            isValidating: false,
          });
          return true;
        } catch {
          // Token is invalid, expired, or rejected by server
          console.warn("Session token validation failed. Logging out.");
          get().logout();
          set({ isValidating: false });
          return false;
        }
      },

      logout: () => {
        set({ currentUser: null, token: null, isLoading: false, isValidating: false });
        if (typeof window !== "undefined") {
          localStorage.removeItem("innovategov-session");
        }
      },

      switchRole: (role: Role) => {
        const current = get().currentUser;
        if (current) {
          const updated: User = { ...current, role };
          set({ currentUser: updated });
        }
      },

      setUser: (user: User, token?: string) => {
        set({
          currentUser: user,
          token: token || get().token || null,
        });
      },
    }),
    {
      name: "innovategov-session",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
