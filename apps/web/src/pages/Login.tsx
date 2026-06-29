import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useNavigate, Link } from "react-router-dom";

import { login } from "../api/auth";
import { useAuthStore } from "../store/authStore";

const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

type FormData = z.infer<typeof schema>;

export default function Login() {

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

            const result = await login(data);

            auth.login(result.accessToken);

            navigate("/");

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

                <h1 className="mb-6 text-center text-3xl font-bold">

                    Login

                </h1>

                <input
                    {...register("email")}
                    placeholder="Email"
                    className="mb-2 w-full rounded border p-2"
                />

                <p className="mb-2 text-red-500">

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

                <button
                    disabled={isSubmitting}
                    className="w-full rounded bg-blue-600 p-2 text-white"
                >

                    Login

                </button>

                <Link
                    to="/register"
                    className="mt-4 block text-center text-blue-600"
                >

                    Create account

                </Link>

            </form>

        </div>

    );

}