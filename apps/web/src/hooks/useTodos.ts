import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getTodos } from "../api/todos";
import { useSocket } from "./useSocket";
import type { Todo } from "../types/todo";

export function useTodos(boardId: string) {

    const queryClient = useQueryClient();
    const socket = useSocket();
    const queryKey = ["todos", boardId];

    // Initial fetch via HTTP
    const query = useQuery({
        queryKey,
        queryFn: () => getTodos(boardId),
        enabled: !!boardId,
    });

    useEffect(() => {

        if (!socket || !boardId) return;

        // Join the board room so the backend starts sending us events
        function joinRoom() {
            socket!.emit("board:join", { boardId });
        }

        joinRoom();

        // IMPORTANT: on reconnect, Socket.io gives us a new socket ID
        // and we lose all room memberships. Re-join automatically so
        // we don't miss events after a brief disconnect.
        socket.on("connect", joinRoom);

        // --- Cache patch handlers ---
        // We use setQueryData instead of invalidateQueries so the update
        // is instant with no extra network round-trip.

        function onCreated(todo: Todo) {
            queryClient.setQueryData<Todo[]>(queryKey, (prev = []) => {
                // Guard: ignore if we already have this todo
                // (shouldn't happen, but safe to check)
                const alreadyExists = prev.some((t) => t.id === todo.id);
                return alreadyExists ? prev : [...prev, todo];
            });
        }

        function onUpdated(todo: Todo) {
            queryClient.setQueryData<Todo[]>(queryKey, (prev = []) =>
                prev.map((t) => (t.id === todo.id ? todo : t))
            );
        }

        function onDeleted({ id }: { id: string }) {
            queryClient.setQueryData<Todo[]>(queryKey, (prev = []) =>
                prev.filter((t) => t.id !== id)
            );
        }

        socket.on("todo:created", onCreated);
        socket.on("todo:updated", onUpdated);
        socket.on("todo:deleted", onDeleted);

        return () => {
            socket.emit("board:leave", { boardId });
            socket.off("connect", joinRoom);
            socket.off("todo:created", onCreated);
            socket.off("todo:updated", onUpdated);
            socket.off("todo:deleted", onDeleted);
        };

    }, [socket, boardId, queryClient]);

    return query;
}
