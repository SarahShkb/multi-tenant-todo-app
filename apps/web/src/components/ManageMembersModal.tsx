import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMembers, addMember, removeMember, type TenantMember } from "../api/tenants";
import { useAuthStore } from "../store/authStore";

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function ManageMembersModal({ open, onClose }: Props) {

    const [email, setEmail] = useState("");
    const [error, setError] = useState("");

    const queryClient = useQueryClient();
    const activeTenant = useAuthStore((s) => s.activeTenant);
    const isAdmin = activeTenant?.role === "admin";

    const { data: members = [], isLoading } = useQuery({
        queryKey: ["tenants", "members"],
        queryFn: getMembers,
        enabled: open,
    });

    const addMutation = useMutation({
        mutationFn: addMember,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tenants", "members"] });
            setEmail("");
            setError("");
        },
        onError: (err: any) => {
            setError(err?.response?.data?.message ?? "Failed to add member.");
        },
    });

    const removeMutation = useMutation({
        mutationFn: removeMember,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tenants", "members"] });
        },
    });

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div className="bg-background rounded-lg border p-6 w-[480px] shadow-xl">

                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold">Workspace members</h2>
                        <p className="text-sm text-muted-foreground">{activeTenant?.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        ✕
                    </button>
                </div>

                {/* Add member form — admin only */}
                {isAdmin && (
                    <div className="mb-4 rounded-md border p-3 bg-muted/40">
                        <p className="text-xs font-medium mb-2">Add member by email</p>
                        <div className="flex gap-2">
                            <input
                                className="flex-1 rounded border px-3 py-1.5 text-sm"
                                placeholder="colleague@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") addMutation.mutate({ email });
                                }}
                            />
                            <button
                                onClick={() => addMutation.mutate({ email })}
                                disabled={!email || addMutation.isPending}
                                className="rounded bg-primary text-primary-foreground px-3 py-1.5 text-sm disabled:opacity-50"
                            >
                                {addMutation.isPending ? "Adding..." : "Add"}
                            </button>
                        </div>
                        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                        <p className="text-xs text-muted-foreground mt-1">
                            The user must already have an account.
                        </p>
                    </div>
                )}

                {/* Members list */}
                {isLoading ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">Loading...</p>
                ) : (
                    <div className="space-y-1 max-h-72 overflow-y-auto">
                        {members.map((member: TenantMember) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted"
                            >
                                <div>
                                    <p className="text-sm font-medium">{member.name}</p>
                                    <p className="text-xs text-muted-foreground">{member.email}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                        member.role === "admin"
                                            ? "bg-primary/10 text-primary"
                                            : "bg-muted text-muted-foreground"
                                    }`}>
                                        {member.role}
                                    </span>

                                    {/* Admin can remove others, not themselves */}
                                    {isAdmin && (
                                        <button
                                            onClick={() => removeMutation.mutate(member.id)}
                                            disabled={removeMutation.isPending}
                                            className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
