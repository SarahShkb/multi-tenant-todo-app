import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../store/authStore";

let socketInstance: Socket | null = null;

export function useSocket(): Socket | null {

    const token = useAuthStore((s) => s.token);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {

        if (!token) {
            if (socketInstance) {
                socketInstance.disconnect();
                socketInstance = null;
            }
            socketRef.current = null;
            return;
        }

        if (socketInstance?.connected) {
            socketRef.current = socketInstance;
            return;
        }

        const socket = io(import.meta.env.VITE_API_URL, {
            auth: { token },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socket.on("connect", () => {
            console.log("[socket] connected:", socket.id);
        });

        socket.on("connect_error", (err) => {
            console.error("[socket] connection error:", err.message);
        });

        socket.on("disconnect", (reason) => {
            console.log("[socket] disconnected:", reason);
        });

        socketInstance = socket;
        socketRef.current = socket;

    }, [token]);

    return socketRef.current;
}
