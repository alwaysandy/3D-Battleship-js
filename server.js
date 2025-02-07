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

async function handleRoomOperation(operation) {
    try {
        await operation();
    } catch (error) {
        console.error('Room operation failed:', error);
        return false;
    }
    return true;
}

io.on('connection', (socket) => {
    socket.on('createRoom', async (userId, callback) => {
        let roomId = utils.createRoomId();
        const success = await handleRoomOperation(async () => {
            while (roomId in rooms) {
                roomId = utils.createRoomId();
            }

            rooms[roomId] = new Room();
            rooms[roomId].players.add(userId);
            rooms[roomId].playerSockets[userId] = socket.id;
            userIds[socket.id] = new User(userId, roomId);
            await socket.join(roomId);
        });

        if (callback) callback({success, room: roomId});
    });

    socket.on('joinRoom', async (userId, roomId, callback) => {
        const success = await handleRoomOperation(async () => {
            const room = rooms[roomId];
            if (room == undefined) throw new Error('Room not found');
            if (room.players.length >= 2) {
                throw new Error(`Room ${roomId} has too many players already.`);
            }

            room.players.add(userId);
            room.playerSockets[userId] = socket.id;
            userIds[socket.id] = userId;
            await socket.join(roomId);

            if (room.players.length < 2) {
                return;
            }

            if (rooms[roomId].gameStatus === "waiting") {
                rooms[roomId].gameStatus = "placing";
                // TODO DOUBLE CHECK THIS
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
            }
        });

        callback({success});
    });

    socket.on('ready', async(userId, roomId, ships, callback) => {
        const success = await handleRoomOperation(async () => {
            if (!roomId || !userId) {
                throw new Error("No room id or user id");
            }

            if (!rooms[roomId]) {
                throw new Error("Room id not found");
            }

            if (!rooms[roomId].players.has(userId)) {
                throw new Error("Room does not have player");
            }

            if (rooms[roomId].readyPlayers.has(userId)) {
                throw new Error("Room already has ready player");
                return;
            }

            rooms[roomId].readyPlayers.add(userId);
            rooms[roomId].ships[userId] = ships;
            if (rooms[roomId].readyPlayers.size === 2) {
                rooms[roomId].gameStatus = "playing";
                io.to(roomId).emit('startGame');
            }
        });

        callback({success});
    });

    socket.on('sendShot', async (userId, roomId, coords, callback) => {
        const success = await handleRoomOperation(async () => {
            if (!rooms[roomId]) {
                throw new Error("Could not send shot: Room not found");
            }

            if (!rooms[roomId].players.has(userId)) {
                throw new Error("Could not send shot: Player not found in room");
            }

            if (!rooms[roomId].turn === userId) {
                throw new Error("Could not send shot: Not users turn");
            }

            const players = Array.from(rooms[roomId].players);
            if (players[0] === userId) {
                io.to(rooms[roomId].playerSockets[players[1]]).emit('receiveShot', coords);
                rooms[roomId].turn = players[1];
            } else {
                io.to(rooms[roomId].playerSockets[players[0]]).emit('receiveShot', coords);
                rooms[roomId].turn = players[0];
            }
        })

        callback({success});
    });


    socket.on('shotResponse', async (userId, roomId, response, callback) => {
        const success = await handleRoomOperation(async () => {
            if (!rooms[roomId]) {
                throw new Error("Could not send shot: Room not found");
            }

            if (!rooms[roomId].players.has(userId)) {
                throw new Error("Could not send shot: Player not found in room");
            }

            const players = Array.from(rooms[roomId].players);
            if (players[0] === userId) {
                io.to(rooms[roomId].playerSockets[players[1]]).emit('shotResponse', response);
            } else {
                io.to(rooms[roomId].playerSockets[players[0]]).emit('shotResponse', response);
            }
        });
        callback({success});
    });


    socket.on('game_over', async (userId, roomId, callback) => {
        const success = await handleRoomOperation(async () => {
            if (!rooms[roomId]) {
                throw new Error("Could not send shot: Room not found");
            }

            if (!rooms[roomId].players.has(userId)) {
                throw new Error("Could not send shot: Player not found in room");
            }

            if (!rooms[roomId].turn === userId) {
                throw new Error("Could not send shot: Not users turn");
            }

            const players = Array.from(rooms[roomId].players);
            if (players[0] === userId) {
                io.to(rooms[roomId].playerSockets[players[1]]).emit('game_over');
            } else {
                io.to(rooms[roomId].playerSockets[players[0]]).emit('game_over');
            }
        })

        callback({success});
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

const PORT = process.env.PORT || 4000;
http.listen(PORT, () => console.log(`Server listening on ${PORT}..`));
