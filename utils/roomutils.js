class Room {
    constructor() {
        this.players = [];
        this.gameStatus = "waiting";
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
    Room,
    createRoomId,
}