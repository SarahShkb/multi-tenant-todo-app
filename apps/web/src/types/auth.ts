export interface LoginDto {
    email: string;
    password: string;
}

export interface RegisterDto {
    email: string;
    tenantSlug: string;
    password: string;
    name: string;
}

export interface AuthResponse {
    accessToken: string;
    user: {
        id: string;
        name: string;
        email: string;
        activeTenantId: string;
    };
}
