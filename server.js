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

    socket.on('cancelRoom', (roomCode) => {
        delete rooms[roomCode];
    });

    socket.on('disconnect', () => {
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

app.get("/game/room/:roomId", (req, res) => {
   const room = req.params.roomId;
   console.log(room);
   res.send(`Entered room ${room}`);
});

const PORT = 8080;
http.listen(PORT, () => console.log(`Server listening on ${PORT}..`));
