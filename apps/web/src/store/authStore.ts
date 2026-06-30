import { create } from "zustand";
import type { TenantInfo } from "../api/auth";

interface AuthState {
    token: string | null;
    isAuthenticated: boolean;

    // Full list of tenants this user belongs to,
    // populated after login and kept in sync after switching.
    tenants: TenantInfo[];

    // The currently active tenant (scoped in the JWT).
    activeTenant: TenantInfo | null;

    // Called after step 2 of login (selectTenant) or after switchTenant.
    // Stores everything needed for the navbar and switcher in one go.
    setSession: (token: string, activeTenant: TenantInfo, tenants: TenantInfo[]) => void;

    // Called when the user switches tenant mid-session.
    // Only the token and activeTenant change — the full tenants list stays the same.
    switchTenant: (token: string, tenant: TenantInfo) => void;

    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({

    token: localStorage.getItem("token"),

    isAuthenticated: !!localStorage.getItem("token"),

    tenants: (() => {
        try {
            return JSON.parse(localStorage.getItem("tenants") ?? "[]");
        } catch {
            return [];
        }
    })(),

    activeTenant: (() => {
        try {
            return JSON.parse(localStorage.getItem("activeTenant") ?? "null");
        } catch {
            return null;
        }
    })(),

    setSession: (token, activeTenant, tenants) => {
        localStorage.setItem("token", token);
        localStorage.setItem("activeTenant", JSON.stringify(activeTenant));
        localStorage.setItem("tenants", JSON.stringify(tenants));
        set({ token, isAuthenticated: true, activeTenant, tenants });
    },

    switchTenant: (token, tenant) => {
        localStorage.setItem("token", token);
        localStorage.setItem("activeTenant", JSON.stringify(tenant));
        // tenants list doesn't change — user's memberships didn't change
        set({ token, activeTenant: tenant });
    },

    logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("activeTenant");
        localStorage.removeItem("tenants");
        set({ token: null, isAuthenticated: false, activeTenant: null, tenants: [] });
    },
}));
