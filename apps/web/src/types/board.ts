export interface Board {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBoardDto {
    name: string;
    description?: string;
}

export interface UpdateBoardDto {
    name?: string;
    description?: string;
}