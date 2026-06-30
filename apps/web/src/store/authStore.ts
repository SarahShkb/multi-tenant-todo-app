import { create } from "zustand";

interface AuthState {

    token: string | null;

    isAuthenticated: boolean;

    setTenantName: (name: string) => void;

    getTenantName: () => string | null;

    login: (token: string) => void;

    register: (token: string) => void;

    logout: () => void;

}

export const useAuthStore = create<AuthState>((set) => ({

    token: localStorage.getItem("token"),

    isAuthenticated: !!localStorage.getItem("token"),

    setTenantName: (name) => {

        localStorage.setItem("tenantName", name);

    },

    getTenantName: () => {

        return localStorage.getItem("tenantName");

    },

    login: (token) => {

        localStorage.setItem("token", token);

        set({
            token,
            isAuthenticated: true,
        });

    },
    register: (token: string) => {

        localStorage.setItem("token", token);

        set({
            token,
            isAuthenticated: true,
        });

    },

    logout: () => {

        localStorage.removeItem("token");

        set({
            token: null,
            isAuthenticated: false,
        });

    },

}));