import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toSlug } from "../utils/slug";


import { useNavigate, Link } from "react-router-dom";

import { register as registerUser } from "../api/auth";

import { useAuthStore } from "../store/authStore";

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

    const auth = useAuthStore();

    const {

        register,

        handleSubmit,

        formState: { errors, isSubmitting },

    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

async function onSubmit(data: FormData) {
    try {

        const result = await registerUser({
            name: data.name,
            email: data.email,
            password: data.password,
            tenantSlug: toSlug(data.organizationName),
        });

        auth.login(result.access_token);

        navigate("/");

    } catch {

        alert("Registration failed");

    }
}

    return (

        <div className="flex min-h-screen items-center justify-center">

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-96 rounded-lg border p-8 shadow"
            >

                <h1 className="mb-6 text-center text-3xl font-bold">

                    Register

                </h1>

                <input
                    {...register("name")}
                    placeholder="Name"
                    className="mb-2 w-full rounded border p-2"
                />

                <p className="text-red-500">

                    {errors.name?.message}

                </p>

                <input
                    {...register("email")}
                    placeholder="Email"
                    className="mb-2 w-full rounded border p-2"
                />

                <p className="text-red-500">

                    {errors.email?.message}

                </p>

                <input
                    type="password"
                    {...register("password")}
                    placeholder="Password"
                    className="mb-2 w-full rounded border p-2"
                />

                <p className="mb-4 text-red-500">

                    {errors.password?.message}

                </p>

                <input
                    {...register("organizationName")}
                    placeholder="Organization name"
                    className="mb-2 w-full rounded border p-2"
                />

                <p className="text-red-500">
                    {errors.organizationName?.message}
                </p>

                <button
                    disabled={isSubmitting}
                    className="w-full rounded bg-green-600 p-2 text-white"
                >

                    Register

                </button>

                <Link
                    to="/login"
                    className="mt-4 block text-center text-blue-600"
                >

                    Already have an account?

                </Link>

            </form>

        </div>

    );

}