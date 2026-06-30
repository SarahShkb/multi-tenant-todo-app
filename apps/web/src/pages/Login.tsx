import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

import { login, selectTenant, type TenantInfo } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import TenantSelectionModal from "../components/TenantSelectionModal";

const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

type FormData = z.infer<typeof schema>;

export default function Login() {

    const [showTenantModal, setShowTenantModal] = useState(false);
    const [tenants, setTenants] = useState<TenantInfo[]>([]);
    const [loginData, setLoginData] = useState<FormData | null>(null);

    const navigate = useNavigate();
    const { setSession, tenants: allTenants } = useAuthStore();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    async function finishLogin(token: string, selectedTenant: TenantInfo, allTenants: TenantInfo[]) {
        // setSession stores token + activeTenant + full tenant list in one shot
        setSession(token, selectedTenant, allTenants);
        navigate("/");
    }

    async function onSubmit(data: FormData) {
        try {
            const result = await login(data);

            if (result.tenants.length === 0) {
                alert("This account has no workspaces.");
                return;
            }

            // Single tenant — skip the selection step entirely
            if (result.tenants.length === 1) {
                const authResult = await selectTenant({
                    email: data.email,
                    password: data.password,
                    tenantId: result.tenants[0].id,
                });
                await finishLogin(authResult.accessToken, result.tenants[0], result.tenants);
                return;
            }

            // Multiple tenants — show picker modal
            setLoginData(data);
            setTenants(result.tenants);
            setShowTenantModal(true);

        } catch {
            alert("Invalid credentials");
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center">

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-96 rounded-lg border p-8 shadow"
            >
                <h1 className="mb-6 text-center text-3xl font-bold">Login</h1>

                <input
                    {...register("email")}
                    placeholder="Email"
                    className="mb-2 w-full rounded border p-2"
                />
                <p className="mb-2 text-red-500">{errors.email?.message}</p>

                <input
                    type="password"
                    {...register("password")}
                    placeholder="Password"
                    className="mb-2 w-full rounded border p-2"
                />
                <p className="mb-4 text-red-500">{errors.password?.message}</p>

                <button
                    disabled={isSubmitting}
                    className="w-full rounded bg-blue-600 p-2 text-white"
                >
                    Login
                </button>

                <Link to="/register" className="mt-4 block text-center text-blue-600">
                    Create account
                </Link>
            </form>

            <TenantSelectionModal
                open={showTenantModal}
                tenants={tenants}
                email={loginData?.email ?? ""}
                password={loginData?.password ?? ""}
                onSuccess={(token, selectedTenant) => {
                    finishLogin(token, selectedTenant, tenants);
                }}
            />
        </div>
    );
}
