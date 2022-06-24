const {WebSocket, WebSocketServer} = require("ws");
const {GameRoom} = require("./GameRoom");
require("dotenv").config()

let wss;
let server;

if (process.env.MODE === "UNSECURE") {
    wss = new WebSocketServer({
        port: process.env.PORT || 8080
    });
} else if (process.env.MODE === "SECURE") {
    const {createServer} = require("https");
    const {readFileSync} = require("fs");
    server = createServer({
        cert: readFileSync(process.env.CERT),
        key: readFileSync(process.env.KEY)
    });
    wss = new WebSocketServer({server});
}

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

if (process.env.MODE === "SECURE") {
    server.listen(process.env.PORT || 8080);
}
