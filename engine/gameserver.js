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
    ws.onmessage = function(message) {
        let data = message.data;
        if (typeof data === "string" && data.startsWith("{")) {
            let json = JSON.parse(data);
            if (json.name === "join") {
                ws.allowedIn = true;
                ws.joinOpts = json.data;
                ws.send(JSON.stringify({
                    name: "welcome",
                    data: {
                        game_width: room.game.width,
                        game_height: room.game.height,
                        chunk_width: room.game.chunkSize
                    }
                }));
            } else if (json.name === "enter" && ws.allowedIn) {
                room.registerNewPlayer(ws, ws.joinOpts);
            }
        } else if (typeof data === "object") {
            let buffer = GameRoom.toArrayBuffer(data);
            let view = new DataView(buffer);

            if (view.getUint8(0) === 225) {
                let pong = new Uint8Array(1);
                pong[0] = 226;
                ws.send(pong);
            }
        }
    }
});

if (process.env.MODE === "SECURE") {
    server.listen(process.env.PORT || 8080).then(() => {
        console.log(`Server listening on ${process.env.PORT}`);
    });
} else {
    console.log(`Server listening on ${process.env.PORT}`);
}
