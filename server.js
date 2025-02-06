import express from "express";
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http)


io.on('connection', (socket) => {
    console.log("Testing");
})

app.get("/", (req, res) => {
    res.send("Hello, world!");
});

const PORT = 8080;
http.listen(PORT, () => console.log(`Server listening on ${PORT}..`));
