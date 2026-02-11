const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

class SocketService {
    constructor() {
        this.io = null;
    }

    init(server) {
        this.io = socketIo(server, {
            cors: {
                origin: '*', // Allow all origins for now
                methods: ['GET', 'POST']
            }
        });

        this.io.use((socket, next) => {
            if (socket.handshake.query && socket.handshake.query.token) {
                jwt.verify(socket.handshake.query.token, process.env.JWT_SECRET, (err, decoded) => {
                    if (err) return next(new Error('Authentication error'));
                    socket.decoded = decoded;
                    next();
                });
            } else {
                next(new Error('Authentication error'));
            }
        });

        this.io.on('connection', (socket) => {
            logger.info(`New client connected: ${socket.id} (User: ${socket.decoded.id}, Role: ${socket.decoded.role})`);

            // Join room based on role
            socket.join(socket.decoded.role);

            socket.on('disconnect', () => {
                logger.info(`Client disconnected: ${socket.id}`);
            });
        });

        logger.info('Socket.io initialized');
    }

    getIO() {
        if (!this.io) {
            throw new Error('Socket.io not initialized!');
        }
        return this.io;
    }

    emitToRole(role, event, data) {
        if (this.io) {
            this.io.to(role).emit(event, data);
            logger.info(`Emitted ${event} to role ${role}`);
        }
    }
}

module.exports = new SocketService();
