import api from "./axios";
import type { User } from "../types/user";

export async function getUsers(): Promise<User[]> {
    const { data } = await api.get<User[]>("/users");
    return data;
}