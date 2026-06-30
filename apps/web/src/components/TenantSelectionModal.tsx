import { useState } from "react";
import { selectTenant, type TenantInfo } from "../api/auth";

interface Props {
    open: boolean;
    tenants: TenantInfo[];
    email: string;
    password: string;
    // Now also passes back the selected tenant so Login can call setSession properly
    onSuccess: (token: string, tenant: TenantInfo) => void;
    onClose?: () => void;
}

export default function TenantSelectionModal({ open, tenants, email, password, onSuccess }: Props) {

    const [selectedId, setSelectedId] = useState<string>("");
    const [loading, setLoading] = useState(false);

    if (!open) return null;

    const selectedTenant = tenants.find((t) => t.id === selectedId);

    async function handleContinue() {
        if (!selectedTenant) return;

        setLoading(true);

        try {
            const result = await selectTenant({ email, password, tenantId: selectedId });
            onSuccess(result.accessToken, selectedTenant);
        } catch {
            alert("Unable to login.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">

                <h2 className="text-xl font-bold mb-1">Select a workspace</h2>
                <p className="text-sm text-gray-500 mb-4">Choose which workspace to log into.</p>

                <div className="space-y-2">
                    {tenants.map((tenant) => (
                        <label
                            key={tenant.id}
                            className="flex items-center gap-3 cursor-pointer rounded-md border p-3 hover:bg-gray-50 transition-colors"
                        >
                            <input
                                type="radio"
                                checked={selectedId === tenant.id}
                                onChange={() => setSelectedId(tenant.id)}
                            />
                            <div>
                                <p className="text-sm font-medium">{tenant.name}</p>
                                <p className="text-xs text-gray-400">{tenant.role}</p>
                            </div>
                        </label>
                    ))}
                </div>

                <button
                    disabled={!selectedId || loading}
                    onClick={handleContinue}
                    className="mt-6 w-full bg-blue-600 text-white rounded p-2 disabled:bg-gray-400"
                >
                    {loading ? "Loading..." : "Continue"}
                </button>

            </div>
        </div>
    );
}
