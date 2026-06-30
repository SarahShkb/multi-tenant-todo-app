import api from "./axios";
import type { LoginDto, RegisterDto, AuthResponse } from "../types/auth";

export interface TenantInfo {
    id: string;
    name: string;
    slug: string;
    role: string;
}

export interface LoginResponse {
    tenants: TenantInfo[];
}

export interface SelectTenantDto {
    email: string;
    password: string;
    tenantId: string;
}

export interface SwitchTenantDto {
    tenantId: string;
}


export const login = async (data: LoginDto): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/login", data);
    return response.data;
};

export const selectTenant = async (data: SelectTenantDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/select-tenant", data);
    return response.data;
};

// Called mid-session when the user picks a different org from the navbar.
// Requires a valid JWT (the current session token) — no password needed.
export const switchTenant = async (data: SwitchTenantDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/switch-tenant", data);
    return response.data;
};

export const register = async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/signup", data);
    return response.data;
};

