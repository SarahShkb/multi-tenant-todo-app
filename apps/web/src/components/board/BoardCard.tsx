import { Link } from "react-router-dom";
import type { Board } from "../../types/board";

interface Props {
    board: Board;
}

export default function BoardCard({
    board,
}: Props) {
    return (
        <Link
            to={`/boards/${board.id}`}
            className="block rounded-lg border p-5 shadow hover:bg-gray-50 transition"
        >
            <h2 className="text-xl font-semibold">

                {board.name}

            </h2>

            {board.description && (
                <p className="mt-2 text-gray-600">
                    {board.description}
                </p>
            )}
        </Link>
    );
}