import type { Todo } from "../../types/todo";
import type { User } from "../../types/user";

interface Props {
    todo: Todo;

    assignee?: User;

    onEdit(): void;

    onDelete(): void;
}

export default function TodoCard({
    todo,
    assignee,
    onEdit,
    onDelete
}: Props) {

    return (

        <div className="rounded border bg-white p-4 shadow-sm">

            <h3 className="font-semibold">

                {todo.title}

            </h3>

            {todo.description && (
                <p className="mt-2 text-sm text-gray-600">
                    {todo.description}
                </p>
            )}
            {assignee && (
                <p className="mt-2 text-sm text-gray-500">
                    Assigned to {assignee.name}
                </p>
            )}
            <div className="mt-4 flex justify-end gap-2">

                <button
                    onClick={onEdit}
                    className="rounded bg-yellow-500 px-3 py-1 text-white"
                >
                    Edit
                </button>

                <button
                    onClick={onDelete}
                    className="rounded bg-red-600 px-3 py-1 text-white"
                >
                    Delete
                </button>

            </div>

        </div>

    );

}