import api from "./axios";
import type {
    Board,
    CreateBoardDto,
    UpdateBoardDto,
} from "../types/board";

export async function getBoards(): Promise<Board[]> {
    const { data } = await api.get("/boards");
    return data;
}

export async function createBoard(
    dto: CreateBoardDto,
): Promise<Board> {
    const { data } = await api.post("/boards", dto);
    return data;
}

export async function updateBoard(
    id: string,
    dto: UpdateBoardDto,
): Promise<Board> {
    const { data } = await api.patch(`/boards/${id}`, dto);
    return data;
}

export async function deleteBoard(
    id: string,
): Promise<void> {
    await api.delete(`/boards/${id}`);
}