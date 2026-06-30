import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import Navbar from "../components/Navbar";
import TodoColumn from "../components/todo/TodoColumn";
import TodoDialog from "../components/todo/TodoDialog";

import { getBoard } from "../api/boards";
import {
    createTodo,
    updateTodo,
    deleteTodo,
} from "../api/todos";

import { useTodos } from "../hooks/useTodos";

import type{
    Todo,
    CreateTodoDto,
    UpdateTodoDto,
} from "../types/todo";

export default function Board() {

    const { id } = useParams();

    const queryClient = useQueryClient();

    const [dialogOpen, setDialogOpen] =
        useState(false);

    const [editingTodo, setEditingTodo] =
        useState<Todo>();

    //-----------------------------------
    // Board
    //-----------------------------------

    const boardQuery = useQuery({

        queryKey: ["board", id],

        queryFn: () => getBoard(id!),

        enabled: !!id,

    });

    //-----------------------------------
    // Todos
    //-----------------------------------

    const todosQuery = useTodos(id!);

    //-----------------------------------
    // Create
    //-----------------------------------

    const createMutation = useMutation({

        mutationFn: (dto: CreateTodoDto) =>
            createTodo(id!, dto),

        onSuccess: () => {

            queryClient.invalidateQueries({
                queryKey: ["todos", id],
            });

        },

    });

    //-----------------------------------
    // Update
    //-----------------------------------

    const updateMutation = useMutation({

        mutationFn: ({
            todoId,
            dto,
        }: {
            todoId: string;
            dto: UpdateTodoDto;
        }) =>
            updateTodo(
                id!,
                todoId,
                dto,
            ),

        onSuccess: () => {

            queryClient.invalidateQueries({
                queryKey: ["todos", id],
            });

        },

    });

    //-----------------------------------
    // Delete
    //-----------------------------------

    const deleteMutation = useMutation({

        mutationFn: (todoId: string) =>
            deleteTodo(id!, todoId),

        onSuccess: () => {

            queryClient.invalidateQueries({
                queryKey: ["todos", id],
            });

        },

    });

    //-----------------------------------
    // Loading
    //-----------------------------------

    if (
        boardQuery.isLoading ||
        todosQuery.isLoading
    ) {

        return <div>Loading...</div>;

    }

    if (!boardQuery.data) {

        return <div>Board not found.</div>;

    }

    //-----------------------------------
    // Data
    //-----------------------------------

    const board = boardQuery.data;

    const todos = todosQuery.data ?? [];

    //-----------------------------------
    // Render
    //-----------------------------------

    return (

        <>
            <Navbar />

            <div className="mx-auto max-w-7xl p-8">

                <Link
                    to="/"
                    className="text-blue-600"
                >
                    ← Back
                </Link>

                <div className="mt-5 flex items-start justify-between">

                    <div>

                        <h1 className="text-4xl font-bold">

                            {board.name}

                        </h1>

                        {board.description && (

                            <p className="mt-3 text-gray-600">

                                {board.description}

                            </p>

                        )}

                    </div>

                    <button
                        className="rounded bg-blue-600 px-4 py-2 text-white"
                        onClick={() => {

                            setEditingTodo(undefined);

                            setDialogOpen(true);

                        }}
                    >
                        + Add Todo
                    </button>

                </div>

                <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">

                    <TodoColumn
                        title="Todo"
                        status="todo"
                        todos={todos}
                        onEdit={(todo) => {

                            setEditingTodo(todo);

                            setDialogOpen(true);

                        }}
                        onDelete={(todo) => {

                            deleteMutation.mutate(todo.id);

                        }}
                    />

                    <TodoColumn
                        title="In Progress"
                        status="in-progress"
                        todos={todos}
                        onEdit={(todo) => {

                            setEditingTodo(todo);

                            setDialogOpen(true);

                        }}
                        onDelete={(todo) => {

                            deleteMutation.mutate(todo.id);

                        }}
                    />

                    <TodoColumn
                        title="Done"
                        status="done"
                        todos={todos}
                        onEdit={(todo) => {

                            setEditingTodo(todo);

                            setDialogOpen(true);

                        }}
                        onDelete={(todo) => {

                            deleteMutation.mutate(todo.id);

                        }}
                    />

                </div>

            </div>

            <TodoDialog
                open={dialogOpen}
                todo={editingTodo}
                onClose={() => {

                    setDialogOpen(false);

                    setEditingTodo(undefined);

                }}
                onSubmit={async (dto) => {

                    if (editingTodo) {

                        await updateMutation.mutateAsync({

                            todoId: editingTodo.id,

                            dto,

                        });

                    } else {

                        await createMutation.mutateAsync(dto);

                    }

                    setDialogOpen(false);

                    setEditingTodo(undefined);

                }}
            />

        </>

    );

}