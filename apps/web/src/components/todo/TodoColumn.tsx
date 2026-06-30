import TodoCard from "./TodoCard";
import type { Todo, TodoStatus } from "../../types/todo";

interface Props {


    title: string;

    status: TodoStatus;

    todos: Todo[];

    onEdit(todo: Todo): void;

    onDelete(todo: Todo): void;

}

export default function TodoColumn({
    title,
    status,
    todos,
    onEdit,
    onDelete
}: Props) {

    return (

        <div className="rounded-lg bg-gray-100 p-4">

            <h2 className="mb-4 text-xl font-bold">

                {title}

            </h2>

            <div className="space-y-3">

                {todos
                    .filter(t => t.status === status)
                    .map(todo => (

                    <TodoCard
                        key={todo.id}
                        todo={todo}
                        onEdit={() => onEdit(todo)}
                        onDelete={() => onDelete(todo)}
                    />

                    ))}

            </div>

        </div>

    );

}