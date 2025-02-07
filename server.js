import express from "express";
import {Room} from "./utils/roomutils.js";
const utils = require('./utils');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http)
const path = require('path');

app.use(express.static('public'));

const rooms = {};

io.on('connection', (socket) => {
    socket.on('createRoom', async (userId, callback) => {
        let roomCode = utils.createRoomId();
        while (roomCode in rooms) {
            roomCode = utils.createRoomId();
        }

        console.log("Creating room: " + roomCode);
        rooms[roomCode] = new Room();
        await socket.join(roomCode);
        if (callback) callback({success: true, room: roomCode});
    });

    socket.on('cancelRoom', (roomCode) => {
        delete rooms[roomCode];
        console.log("Deleting room: " + roomCode);
    })
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
