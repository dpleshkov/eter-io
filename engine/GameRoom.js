const {WebSocket, WebsocketServer} = require("ws");
const Chunk = require("../public/js/classes/Chunk").Chunk;
const CircleObstacle = require("../public/js/classes/CircleObstacle").CircleObstacle;
const Entity = require("../public/js/classes/Entity").Entity;
const Game = require("../public/js/classes/Game").Game;
const PlayerEntity = require("../public/js/classes/PlayerEntity").PlayerEntity;
const ProjectileEntity = require("../public/js/classes/ProjectileEntity").ProjectileEntity;
const Util = require("../public/js/classes/Util").Util;
const Vector = require("../public/js/classes/Vector").Vector;
const Vector2 = require("../public/js/classes/Vector2").Vector2;

class GameRoom {
    constructor() {
        const self = this;

        self.game = new Game(256, 256, 64);
        self.obstacles = [];
        self.players = [];
        self.projectiles = new Set();
        for (let x = 0; x < 512; x++) {
            self.obstacles.push(new CircleObstacle(new Vector2(Util.randInt(3, 253), Util.randInt(3, 253)), self.game, {
                radius: Util.randInt(1, 3),
                color: "#ffffff"
            }));
        }

    }

    getNewPlayerID() {
        const self = this;

        for (let x = 0; x < self.players.length; x++) {
            if (typeof self.players[x] === "undefined") {
                return x;
            }
        }
        if (self.players.length < 256) return self.players.length;
    }

    findPlayerSpawn() {
        const self = this;

        let attempts = 0;
        while (attempts <= 10) {
            let x = Util.randInt(3, 253);
            let y = Util.randInt(3, 253);
            let position = new Vector2(x, y);
            let possibleProblems = self.game.lookup("CircleObstacle", position, 5);
            let cont = false;
            for (let problem of possibleProblems) {
                if (problem.position.distanceTo(position) < 1 + problem.radius) {
                    cont = true;
                    break;
                }
            }
            if (!cont) return position;
            attempts += 1;
        }
    }

    registerNewPlayer(socket) {
        const self = this;

        let id = self.getNewPlayerID();
        if (id === -1) {
            socket.send(JSON.stringify({
                "error": "cannot_join"
            }));
        }

        let position = self.findPlayerSpawn();
        if (!position) {
            socket.send(JSON.stringify({
                "error": "cannot_join"
            }));
        }

        let player = new PlayerEntity(position, new Vector2(), self.game, {
            id: id,
            socket: socket
        });

        self.players[id] = player;

        socket.send(JSON.stringify({
            "joined": {
                "id": id
            }
        }));

        for (let obstacle of self.obstacles) {
            socket.send(GameRoom.serialize(obstacle));
        }

        socket.onmessage = function(message) {
            let data = message.data;
            if (typeof data === "object") {
                let buffer = GameRoom.toArrayBuffer(data);
                let view = new DataView(buffer);

                if (view.getUint8(0) === 223) {
                    let movementByte = view.getUint8(1);
                    let right = movementByte & 0b0001;
                    let left = movementByte & 0b0010;
                    let up = movementByte & 0b0100;
                    let down = movementByte & 0b1000;
                    if (right - left || down - up) {
                        let dir = Math.atan2(down - up, right - left);
                        player.movementAcceleration.x = 30 * Math.cos(dir);
                        player.movementAcceleration.y = 30 * Math.sin(dir);
                    } else {
                        player.movementAcceleration.x = 0;
                        player.movementAcceleration.y = 0;
                    }
                } else if (view.getUint8(0) === 224) {
                    let direction = view.getUint16(1);
                    let angle = direction / 65536 * 2 * Math.PI;
                    let projectile = player.fire(angle, 30, 0.25);
                    if (projectile) {
                        player.socket.send(GameRoom.serialize(projectile));
                        projectile.sentTo.add(player.entityId);
                    }
                } else if (view.getUint8(0) === 225) {
                    let pong = new Uint8Array(1);
                    pong[0] = 226;
                    player.socket.send(pong);
                }
            }
        }

        socket.onclose = function() {
            if (!self.players[id]) return;
            self.players[id].destroy();
            delete self.players[id];
            self.players[id] = undefined;
        }

    }

    tick() {
        const self = this;

        for (let player of self.players) {
            if (!player) continue;
            if (player.dead || player.destroyed) {
                for (let entity of self.players) {
                    if (entity !== player) {
                        entity.socket.send(JSON.stringify({
                            name: "player_gone",
                            data: {
                                id: player.id
                            }
                        }));
                    }
                }
                player.socket.close();
                self.players[player.id] = undefined;
                continue;
            }
            player.tick();
            let players = self.game.lookup("PlayerEntity", player.position, 64);
            for (let entity of players) {
                let data = GameRoom.serialize(entity);
                player.socket.send(data);
            }
            let projectiles = self.game.lookup("ProjectileEntity", player.position, 64);
            for (let entity of projectiles) {
                entity.tick();
                if (!entity.sentTo.has(player.entityId)) {
                    player.socket.send(GameRoom.serialize(entity));
                    entity.sentTo.add(player.entityId);
                }
            }
        }
    }

    static serialize(entity) {
        if (!entity) return;
        if (entity.constructor.name === "CircleObstacle") {
            let buffer = new ArrayBuffer(4);
            let view = new DataView(buffer);

            view.setUint8(0, 36);
            view.setUint8(1, entity.position.x % 256);
            view.setUint8(2, entity.position.y % 256);
            view.setUint8(3, entity.radius);

            return buffer;
        } else if (entity.constructor.name === "PlayerEntity") {
            let buffer = new ArrayBuffer(32);
            let view = new DataView(buffer);

            view.setUint8(0, 37);
            view.setFloat32(1, entity.position.x);
            view.setFloat32(5, entity.position.y);
            view.setFloat32(9, entity.velocity.x);
            view.setFloat32(13, entity.velocity.y);
            view.setFloat32(17, entity.movementAcceleration.x);
            view.setFloat32(21, entity.movementAcceleration.y);
            view.setUint8(25, entity.radius);
            view.setFloat32(26, entity.hp);
            view.setUint8(30, entity.dead ? 1 : 0);
            view.setUint8(31, entity.id);

            return buffer;
        } else if (entity.constructor.name === "ProjectileEntity") {
            let buffer = new ArrayBuffer(18);
            let view = new DataView(buffer);

            view.setUint8(0, 38);
            view.setFloat32(1, entity.position.x);
            view.setFloat32(5, entity.position.y);
            view.setFloat32(9, entity.velocity.x);
            view.setFloat32(13, entity.velocity.y);
            view.setUint8(17, entity.bounces);

            return buffer;
        }
    }

    static toArrayBuffer(buf) {
        const ab = new ArrayBuffer(buf.length);
        const view = new Uint8Array(ab);
        for (let i = 0; i < buf.length; ++i) {
            view[i] = buf[i];
        }
        return ab;
    }
}

module.exports.GameRoom = GameRoom;