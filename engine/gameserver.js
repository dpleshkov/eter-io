const {WebSocket, WebSocketServer} = require("ws");
const {GameRoom} = require("./GameRoom");


const wss = new WebSocketServer({
    port: 8080
});

let room = new GameRoom();

let tick = function() {
    room.tick();
    setTimeout(tick, 50);
}

tick();

wss.on("connection", (ws) => {
    console.log("connection");
    room.registerNewPlayer(ws);
});

