import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { SERVER_URL } from '../services/api';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Initialize socket connection
            // Socket URL from shared config
            const socketUrl = SERVER_URL;

            const newSocket = io(socketUrl, {
                query: { token },
                transports: ['websocket']
            });

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
            });

            newSocket.on('connect_error', (err) => {
                console.error('Socket connection error:', err);
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        }
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
