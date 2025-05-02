import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { getDataFromLocalStorage } from "../utils/helper";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const socket = useRef(null);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const token = getDataFromLocalStorage()?.token;

        if (token) {
            socket.current = io(import.meta.env.VITE_SOCKET_URL, {
                auth: {
                    token,
                },
            });

            socket.current.on("connection", () => {
                console.log("✅ Connected to socket:", socket.current.id);
            });

            socket.current.on("disconnect", () => {
                console.log("❌ Disconnected from socket");
            });

            return () => {
                socket.current.disconnect();
            };
        }
    }, [isAuthenticated]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
