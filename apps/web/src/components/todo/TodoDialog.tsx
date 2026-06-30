import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import type {
    Todo,
    CreateTodoDto,
} from "../../types/todo";

const schema = z.object({
    title: z.string().min(1, "Title is required"),

    description: z.string().optional(),

    status: z.enum([
        "todo",
        "in-progress",
        "done",
    ]),

    assignee: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {

    open: boolean;

    todo?: Todo;

    onClose(): void;

    onSubmit(dto: CreateTodoDto): void | Promise<void>;

}

export default function TodoDialog({
    open,
    todo,
    onClose,
    onSubmit,
}: Props) {

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: "",
            description: "",
            status: "todo",
            assignee: "",
        },
    });

    useEffect(() => {

        if (todo) {

            reset({
                title: todo.title,
                description: todo.description ?? "",
                status: todo.status,
                assignee: todo.assignee ?? "",
            });

        } else {

            reset({
                title: "",
                description: "",
                status: "todo",
                assignee: "",
            });

        }

    }, [todo, reset]);

    if (!open) return null;

    return (

        <div className="fixed inset-0 flex items-center justify-center bg-black/50">

            <div className="w-full max-w-lg rounded-lg bg-white p-6">

                <h2 className="mb-6 text-2xl font-bold">

                    {todo ? "Edit Todo" : "Create Todo"}

                </h2>

                <form
                    onSubmit={handleSubmit(async (data) => {

                        await onSubmit(data);

                        onClose();

                    })}
                >

                    <div className="mb-4">

                        <input
                            {...register("title")}
                            placeholder="Title"
                            className="w-full rounded border p-2"
                        />

                        <p className="text-red-500">

                            {errors.title?.message}

                        </p>

                    </div>

                    <div className="mb-4">

                        <textarea
                            {...register("description")}
                            placeholder="Description"
                            rows={4}
                            className="w-full rounded border p-2"
                        />

                    </div>

                    <div className="mb-4">

                        <select
                            {...register("status")}
                            className="w-full rounded border p-2"
                        >

                            <option value="todo">

                                Todo

                            </option>

                            <option value="in-progress">

                                In Progress

                            </option>

                            <option value="done">

                                Done

                            </option>

                        </select>

                    </div>

                    <div className="mb-6">

                        <input
                            {...register("assignee")}
                            placeholder="Assignee"
                            className="w-full rounded border p-2"
                        />

                    </div>

                    <div className="flex justify-end gap-3">

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded border px-4 py-2"
                        >

                            Cancel

                        </button>

                        <button
                            disabled={isSubmitting}
                            className="rounded bg-blue-600 px-4 py-2 text-white"
                        >

                            {todo ? "Save" : "Create"}

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}