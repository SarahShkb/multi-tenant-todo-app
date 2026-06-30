import { useState } from "react";
import { selectTenant } from "../api/auth";

interface Tenant {
    id: string;
    name: string;
    slug: string;
    role: string;
}

interface Props {
    open: boolean;
    tenants: Tenant[];

    email: string;
    password: string;

    onSuccess: (token: string) => void;
    onClose?: () => void;
}

export default function TenantSelectionModal({
    open,
    tenants,
    email,
    password,
    onSuccess,
}: Props) {

    const [selectedTenant, setSelectedTenant] =
        useState<string>("");

    const [loading, setLoading] = useState(false);

    if (!open)
        return null;

    async function handleContinue() {

        if (!selectedTenant)
            return;

        setLoading(true);

        try {

            const result = await selectTenant({
                email,
                password,
                tenantId: selectedTenant,
            });

            onSuccess(result.accessToken);

        } catch {

            alert("Unable to login.");

        } finally {

            setLoading(false);

        }
    }

    return (

        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">

            <div className="bg-white rounded-lg p-6 w-96">

                <h2 className="text-xl font-bold mb-4">
                    Select a workspace
                </h2>

                <div className="space-y-2">

                    {tenants.map((tenant) => (

                        <label
                            key={tenant.id}
                            className="flex items-center gap-2 cursor-pointer"
                        >

                            <input
                                type="radio"
                                checked={selectedTenant === tenant.id}
                                onChange={() =>
                                    setSelectedTenant(tenant.id)
                                }
                            />

                            <span>
                                {tenant.name}
                            </span>

                        </label>

                    ))}

                </div>

                <button
                    disabled={!selectedTenant || loading}
                    onClick={handleContinue}
                    className="mt-6 w-full bg-blue-600 text-white rounded p-2 disabled:bg-gray-400"
                >

                    {loading
                        ? "Loading..."
                        : "Continue"}

                </button>

            </div>

        </div>

    );

}