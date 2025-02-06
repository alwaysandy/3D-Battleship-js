import express from "express";
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http)
const path = require('path');

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log("Testing");
})

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'place_ships.html'));
});

app.get("/room/:roomId", (req, res) => {
   const room = req.params.roomId;
   console.log(room);
   res.send(`Entered room ${room}`);
});

const PORT = 8080;
http.listen(PORT, () => console.log(`Server listening on ${PORT}..`));
