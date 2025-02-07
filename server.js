import express from "express";
import {User, Room} from "./utils/roomutils.js";
const utils = require('./utils');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http)
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

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
        rooms[roomId].playerSockets[userId] = socket.id;
        userIds[socket.id] = new User(userId, roomId);
        await socket.join(roomId);
        if (callback) callback({success: true, room: roomId});
    });

    socket.on('joinRoom', async (userId, roomId, callback) => {
        const room = rooms[roomId];
        console.log(roomId);
        if (!room) throw new Error('Room not found');
        if (room.players.length >= 2) {
            throw new Error(`Room ${roomId} has too many players already.`);
        }

        room.players.add(userId);
        room.playerSockets[userId] = socket.id;
        userIds[socket.id] = userId;
        await socket.join(roomId);

        if (room.players.length < 2) {
            callback({success: true, room: roomId});
            return;
        }

        if (rooms[roomId].gameStatus === "waiting") {
            rooms[roomId].gameStatus = "placing";
            callback({success: true, room: roomId});
            io.to(roomId).emit('startPlacing', {
                success: true,
                roomId,
            });
            return;
        }

        if (rooms[roomId].gameStatus === "playing") {
            rooms[roomId].chooseFirstTurn();

            for (let player of rooms[roomId].players) {
                io.to(rooms[roomId].playerSockets[player]).emit(
                    "start_game",
                    {
                        ships: rooms[roomId].ships[player],
                        turn: rooms[roomId].turn,
                    }
                );
            }
            callback({success: true});
        }

        callback({success: true});
    });

    socket.on('ready', async(userId, roomId, ships, callback) => {
        if (!roomId || !userId) {
            callback({success: false});
            console.error("No room id or user id");
            return;
        }

        if (!rooms[roomId]) {
            callback({success: false});
            console.error("Room id not found");
            return;
        }

        if (!rooms[roomId].players.has(userId)) {
            callback({success: false});
            console.error("Room does not have player");
            return;
        }

        if (rooms[roomId].readyPlayers.has(userId)) {
            callback({success: false});
            console.log(userId);
            console.log(rooms[roomId])
            console.error("Room already has ready player");
            return;
        }

        rooms[roomId].readyPlayers.add(userId);
        rooms[roomId].ships[userId] = ships;
        if (rooms[roomId].readyPlayers.size === 2) {
            rooms[roomId].gameStatus = "playing";
            callback({success: true});
            io.to(roomId).emit('startGame');
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
        delete rooms[user.roomId].playerSockets[user.userId];
    });
})

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get("/game/placeships", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'placeships.html'));
});

app.get("/game/play", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'game.html'));
})

const PORT = 8080;
http.listen(PORT, () => console.log(`Server listening on ${PORT}..`));
