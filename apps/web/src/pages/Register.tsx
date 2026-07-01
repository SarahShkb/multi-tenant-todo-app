import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

import { register as registerUser } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import { toSlug } from "../utils/slug";

const schema = z.object({
    name: z.string().min(2),
    organizationName: z
        .string()
        .min(2, "Organization name is required")
        .max(50, "Organization name is too long"),
    email: z.string().email(),
    password: z.string().min(6),
});

type FormData = z.infer<typeof schema>;

export default function Register() {

    const navigate = useNavigate();
    const { setSession } = useAuthStore();
    const [error, setError] = useState("");

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({ resolver: zodResolver(schema) });

    // Live slug preview so the user knows what their org URL will be
    const orgName = watch("organizationName", "");
    const slug = toSlug(orgName);

    async function onSubmit(data: FormData) {
        setError("");

        try {
            const result = await registerUser({
                name: data.name,
                email: data.email,
                password: data.password,
                tenantSlug: slug,
            });

            // Build the activeTenant object from what we already know locally.
            // The user just created this org so they're always the admin,
            // and we have the name/slug from the form — no extra API call needed.
            const activeTenant = {
                id: result.user.activeTenantId,
                name: data.organizationName,
                slug,
                role: "admin" as const,
            };

            // Single call replaces the old auth.setTenantName() + auth.login()
            setSession(result.accessToken, activeTenant, [activeTenant]);

            navigate("/");

        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Registration failed");
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-96 rounded-lg border p-8 shadow"
            >
                <h1 className="mb-6 text-center text-3xl font-bold">Register</h1>

                <input
                    {...register("name")}
                    placeholder="Name"
                    className="mb-1 w-full rounded border p-2"
                />
                <p className="mb-2 text-sm text-red-500">{errors.name?.message}</p>

                <input
                    {...register("email")}
                    placeholder="Email"
                    className="mb-1 w-full rounded border p-2"
                />
                <p className="mb-2 text-sm text-red-500">{errors.email?.message}</p>

                <input
                    type="password"
                    {...register("password")}
                    placeholder="Password"
                    className="mb-1 w-full rounded border p-2"
                />
                <p className="mb-2 text-sm text-red-500">{errors.password?.message}</p>

                <input
                    {...register("organizationName")}
                    placeholder="Organization name"
                    className="mb-1 w-full rounded border p-2"
                />
                <p className="mb-1 text-sm text-red-500">{errors.organizationName?.message}</p>

                {/* Live slug preview */}
                {slug && (
                    <p className="mb-4 text-xs text-muted-foreground">
                        Workspace URL: <span className="font-mono font-medium">{slug}</span>
                    </p>
                )}

                {error && (
                    <p className="mb-3 text-sm text-red-500">{error}</p>
                )}

                <button
                    disabled={isSubmitting}
                    className="w-full rounded bg-green-600 p-2 text-white disabled:opacity-50"
                >
                    Register
                </button>

                <Link to="/login" className="mt-4 block text-center text-blue-600">
                    Already have an account?
                </Link>
            </form>
        </div>
    );
}
