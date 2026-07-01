import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Navbar from "../components/Navbar";
import TodoColumn from "../components/todo/TodoColumn";
import TodoDialog from "../components/todo/TodoDialog";

import { getBoard } from "../api/boards";
import { createTodo, updateTodo, deleteTodo } from "../api/todos";
import { useTodos } from "../hooks/useTodos";
import { useUsers } from "../hooks/useUsers";

import type { Todo, CreateTodoDto, UpdateTodoDto } from "../types/todo";

export default function Board() {

    const { id } = useParams();
    const queryClient = useQueryClient();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTodo, setEditingTodo] = useState<Todo>();

    const usersQuery = useUsers();
    const users = usersQuery.data ?? [];

    const boardQuery = useQuery({
        queryKey: ["board", id],
        queryFn: () => getBoard(id!),
        enabled: !!id,
    });

    // useTodos now handles both fetching AND real-time updates.
    // It joins the board room on mount and patches the cache on socket events.
    const todosQuery = useTodos(id!);

    // -------------------------------------------------------
    // Mutations — notice NO onSuccess invalidateQueries calls.
    //
    // We don't need to refetch after a mutation because the backend
    // will emit a socket event (todo:created / updated / deleted)
    // back to everyone in the room — including the user who made
    // the change — and useTodos will update the cache from that.
    //
    // This means:
    //   Alice creates a todo → HTTP POST → backend saves → emits todo:created
    //   → Alice's socket receives it → cache updated → Alice sees it
    //   → Bob's socket receives it  → cache updated → Bob sees it
    // -------------------------------------------------------

    const createMutation = useMutation({
        mutationFn: (dto: CreateTodoDto) => createTodo(id!, dto),
    });

    const updateMutation = useMutation({
        mutationFn: ({ todoId, dto }: { todoId: string; dto: UpdateTodoDto }) =>
            updateTodo(id!, todoId, dto),
    });

    const deleteMutation = useMutation({
        mutationFn: (todoId: string) => deleteTodo(id!, todoId),
    });

    if (boardQuery.isLoading || todosQuery.isLoading) {
        return <div>Loading...</div>;
    }

    if (!boardQuery.data) {
        return <div>Board not found.</div>;
    }

    const board = boardQuery.data;
    const todos = todosQuery.data ?? [];

    function openEdit(todo: Todo) {
        setEditingTodo(todo);
        setDialogOpen(true);
    }

    function openCreate() {
        setEditingTodo(undefined);
        setDialogOpen(true);
    }

    function closeDialog() {
        setDialogOpen(false);
        setEditingTodo(undefined);
    }

    return (
        <>
            <Navbar />

            <div className="mx-auto max-w-7xl p-8">

                <Link to="/" className="text-blue-600">← Back</Link>

                <div className="mt-5 flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-bold">{board.name}</h1>
                        {board.description && (
                            <p className="mt-3 text-gray-600">{board.description}</p>
                        )}
                    </div>
                    <button
                        className="rounded bg-blue-600 px-4 py-2 text-white"
                        onClick={openCreate}
                    >
                        + Add Todo
                    </button>
                </div>

                <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {(["todo", "in-progress", "done"] as const).map((status) => (
                        <TodoColumn
                            key={status}
                            title={
                                status === "todo" ? "Todo"
                                : status === "in-progress" ? "In Progress"
                                : "Done"
                            }
                            status={status}
                            todos={todos}
                            users={users}
                            onEdit={openEdit}
                            onDelete={(todo) => deleteMutation.mutate(todo.id)}
                        />
                    ))}
                </div>
            </div>

            <TodoDialog
                open={dialogOpen}
                todo={editingTodo}
                onClose={closeDialog}
                onSubmit={async (dto) => {
                    if (editingTodo) {
                        await updateMutation.mutateAsync({
                            todoId: editingTodo.id,
                            dto,
                        });
                    } else {
                        await createMutation.mutateAsync(dto);
                    }
                    closeDialog();
                }}
            />
        </>
    );
}
