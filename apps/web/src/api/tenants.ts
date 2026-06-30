import api from "./axios";

export interface TenantMember {
    id: string;
    name: string;
    email: string;
    role: "member" | "admin";
    joinedAt: string;
}

export interface AddMemberDto {
    email: string;
    role?: "member" | "admin";
}

// GET /tenants/members — visible to all members
export const getMembers = async (): Promise<TenantMember[]> => {
    const response = await api.get<TenantMember[]>("/tenants/members");
    return response.data;
};

// POST /tenants/members — admin only
export const addMember = async (data: AddMemberDto): Promise<TenantMember> => {
    const response = await api.post<TenantMember>("/tenants/members", data);
    return response.data;
};

// DELETE /tenants/members/:userId — admin only
export const removeMember = async (userId: string): Promise<void> => {
    await api.delete(`/tenants/members/${userId}`);
};
