import api from "./axios";
import type {
    LoginDto,
    RegisterDto,
    AuthResponse,
} from "../types/auth";

export const login = async (
    data: LoginDto
): Promise<AuthResponse> => {

    const response = await api.post<AuthResponse>(
        "/auth/login",
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