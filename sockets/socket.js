const { Server } = require("socket.io");
const intervals = require('../utils/intervals');
const jwt = require('jsonwebtoken');

function startSocket(server) {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true,
        },
    });

    io.use((socket, next) => {
        const cookieHeader = socket.handshake.headers.cookie;

        if (!cookieHeader) {
            return next(new Error('No cookies found'));
        }

        const cookies = Object.fromEntries(
            cookieHeader.split(';').map(cookie => {
                const [name, ...rest] = cookie.trim().split('=');
                return [name, rest.join('=')];
            })
        );

        const token = cookies['jwt'];

        if (!token) {
            return next(new Error('JWT cookie not found'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.data.userId = decoded.id;
            next();
        } catch (err) {
            next(new Error('Invalid token'));
        }
    });


    io.on('connection', (socket) => {
        socket.on('joinUserRoom', () => {
            const userId = socket.data.userId;
            socket.join(userId);
        });

        socket.on('disconnect', () => {
            const userId = socket.data.userId;
            if (!userId) return;

            const interval = intervals.get(userId);
            if (interval) {
                clearInterval(interval);
                intervals.delete(userId);
            }
        });
    });

    global.io = io;
};

module.exports = { startSocket };