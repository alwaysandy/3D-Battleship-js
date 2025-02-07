const {constructor} = require("bun");

class Room {
    constructor() {
        this.players = new Set();
        this.gameStatus = "waiting";
    }
}

class User {
    constructor(userId, roomId) {
        this.userId = userId;
        this.roomId = roomId;
    }
}

function createRoomId() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789";
    let roomCode = ""
    for (let i = 0; i < 4; i++) {
        roomCode += characters[Math.floor(Math.random() * characters.length)];
    }

    return roomCode;
}

module.exports = {
    User,
    Room,
    createRoomId,
}