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

export const login = async (
    data: LoginDto
): Promise<LoginResponse> => {

    const response = await api.post<LoginResponse>(
        "/auth/login",
        data
    );

    return response.data;
};

export const selectTenant = async (
    data: SelectTenantDto
): Promise<AuthResponse> => {

    const response = await api.post<AuthResponse>(
        "/auth/select-tenant",
        data
    );

    return response.data;
};


export const register = async (
    data: RegisterDto
): Promise<AuthResponse> => {

    const response = await api.post<AuthResponse>(
        "/auth/signup",
        data
    );

    return response.data;
};