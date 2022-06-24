const {WebSocket, WebSocketServer} = require("ws");
const {GameRoom} = require("./GameRoom");
require("dotenv").config()


const wss = new WebSocketServer({
    port: process.env.PORT
});

let room = new GameRoom();

let targetTPS = 60;
let tickInterval = 1000/targetTPS;

let tick = function() {
    let t1 = Date.now();
    room.tick();
    let t2 = Date.now();
    setTimeout(tick, tickInterval - (t2 - t1));
}

tick();

wss.on("connection", (ws) => {
    room.registerNewPlayer(ws);
});

