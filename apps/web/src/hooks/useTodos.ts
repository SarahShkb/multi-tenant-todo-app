import { useQuery } from "@tanstack/react-query";

import { getTodos } from "../api/todos";

export function useTodos(boardId: string) {

    return useQuery({

        queryKey: ["todos", boardId],

        queryFn: () => getTodos(boardId),

    });

}