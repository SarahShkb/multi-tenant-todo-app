import api from "./axios";

import type {
    Todo,
    CreateTodoDto,
    UpdateTodoDto,
} from "../types/todo";

export async function getTodos(boardId: string) {

    const { data } = await api.get<Todo[]>(
        `/boards/${boardId}/todos`,
    );

    return data;
}

export async function createTodo(
    boardId: string,
    dto: CreateTodoDto,
) {

    const { data } = await api.post<Todo>(
        `/boards/${boardId}/todos`,
        dto,
    );

    return data;
}

export async function updateTodo(
    boardId: string,
    todoId: string,
    dto: UpdateTodoDto,
) {

    const { data } = await api.patch<Todo>(
        `/boards/${boardId}/todos/${todoId}`,
        dto,
    );

    return data;
}

export async function deleteTodo(
    boardId: string,
    todoId: string,
) {

    await api.delete(
        `/boards/${boardId}/todos/${todoId}`,
    );

}