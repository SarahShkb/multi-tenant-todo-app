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
    access_token: string;
}