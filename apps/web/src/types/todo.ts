export type TodoStatus =
    | "todo"
    | "in-progress"
    | "done";

export interface Todo {
    id: string;
    title: string;
    description?: string;
    status: TodoStatus;
    assigneeId?: string;
    boardId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTodoDto {
    title: string;
    description?: string;
    status?: TodoStatus;
    assigneeId?: string;
}

export interface UpdateTodoDto {
    title?: string;
    description?: string;
    status?: TodoStatus;
    assigneeId?: string;
}