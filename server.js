import express from "express";
import {User, Room} from "./utils/roomutils.js";
const utils = require('./utils');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http)
const path = require('path');

app.use(express.static('public'));

const rooms = {};
const userIds = {};

io.on('connection', (socket) => {
    socket.on('createRoom', async (userId, callback) => {
        let roomId = utils.createRoomId();
        while (roomId in rooms) {
            roomId = utils.createRoomId();
        }

        rooms[roomId] = new Room();
        rooms[roomId].players.add(userId);
        userIds[socket.id] = new User(userId, roomId);
        await socket.join(roomId);
        if (callback) callback({success: true, room: roomId});
    });

    socket.on('joinRoom', async (userId, roomId, callback) => {
        const room = rooms[roomId];
        if (!room) throw new Error('Room not found');
        if (room.players.length >= 2) {
            throw new Error(`Room ${roomId} has too many players already.`);
        }

        room.players.add(userId);
        userIds[socket.id] = userId;
        await socket.join(roomId);
        io.to(roomId).emit('startPlacing', {
            success: true,
            roomId,
        });

        callback({success: true, room: roomId});
    });

    socket.on('ready', async(userId, roomId, board, callback) => {
        if (!roomId || !userId) {
            callback({success: false});
            return;
        }

        if (!rooms[roomId]) {
            callback({success: false});
            return;
        }

        if (!rooms[roomId].players.has(userId)) {
            callback({success: false});
            return;
        }

        if (rooms[roomId].readyPlayers.has(userId)) {
            callback({success: false});
            return;
        }

        rooms[roomId].players.add(userId);
        if (rooms[roomId].readyPlayers.length == 2) {
            // Emit Game start
        }

        callback({success: true});
    });

    socket.on('cancelRoom', async (roomCode) => {
        delete rooms[roomCode];
    });

    socket.on('disconnect', async () => {
        const user = userIds[socket.id];
        if (!user) {
            return;
        }

        if (!rooms[user.roomId]) {
            return;
        }

        rooms[user.roomId].players.delete(user.userId);
    });
})

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get("/game/placeships", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'placeships.html'));
});

const PORT = 8080;
http.listen(PORT, () => console.log(`Server listening on ${PORT}..`));
