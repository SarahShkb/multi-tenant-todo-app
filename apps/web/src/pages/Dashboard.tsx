import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

import { createBoard } from "../api/boards";
import { useBoards } from "../hooks/useBoards";

import BoardCard from "../components/board/BoardCard";
import CreateBoardModal from "../components/board/CreateBoardModal";
import Navbar from "../components/Navbar";

export default function Dashboard() {

    const queryClient = useQueryClient();

    const { data, isLoading } = useBoards();

    const mutation = useMutation({
        mutationFn: createBoard,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["boards"],
            });
        },
    });

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Navbar />

            <div className="mx-auto max-w-5xl p-8">

                <CreateBoardModal
                    onCreate={async (
                        name,
                        description,
                    ) => {
                        await mutation.mutateAsync({
                            name,
                            description,
                        });
                    }}
                />

                <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

                    {data?.map((board) => (
                        <BoardCard
                            key={board.id}
                            board={board}
                        />
                    ))}
                    {data?.length === 0 && (
                        <div className="rounded-lg border border-dashed p-10 text-center">

                            <h2 className="text-2xl font-semibold">

                                No boards yet!

                            </h2>

                            <p className="mt-2 text-gray-500">

                                Create your first board to get started.

                            </p>

                        </div>
                    )}

                </div>

            </div>
        </>
    );
}