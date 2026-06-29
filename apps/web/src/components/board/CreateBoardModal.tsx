import { useState } from "react";

interface Props {
    onCreate(
        name: string,
        description: string,
    ): Promise<void>;
}

export default function CreateBoardModal({
    onCreate,
}: Props) {
    const [name, setName] = useState("");

    const [description, setDescription] =
        useState("");

    return (
        <div className="rounded-lg border p-5">

            <h2 className="mb-4 text-xl font-bold">

                Create Board

            </h2>

            <input
                value={name}
                onChange={(e) =>
                    setName(e.target.value)
                }
                placeholder="Board name"
                className="mb-3 w-full rounded border p-2"
            />

            <textarea
                value={description}
                onChange={(e) =>
                    setDescription(e.target.value)
                }
                placeholder="Description"
                className="mb-4 w-full rounded border p-2"
            />

            <button
                className="rounded bg-blue-600 px-4 py-2 text-white"
                onClick={() =>
                    onCreate(name, description)
                }
            >
                Create
            </button>

        </div>
    );
}