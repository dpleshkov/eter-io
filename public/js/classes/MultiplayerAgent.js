class MultiplayerAgent {
    constructor(address, options) {
        const self = this;

        self.options = options;
        self.socket = new WebSocket(address);
        self._registerHandlers();

        self.game = undefined;
        self.players = [];

        self.projectileConfirmations = [];

        self.lagCompensationMode = "one way";
    }

    _registerHandlers() {
        const self = this;

        self.socket.addEventListener("open", () => {
            self.socket.send(JSON.stringify({
                "name": "join",
                "data": {
                    "player_name": self.options.player_name || Util.choose(["Anonymous", "Unnamed", "Player"])
                }
            }));
        });

        self.socket.addEventListener("message", async(evt) => {
            let data = evt.data;
            if (typeof data === "object") {
                let buf = await data.arrayBuffer();
                let view = new DataView(buf);
                switch (view.getUint8(0)) {
                    case 36:
                        self.deserializeCircleObstacle(view);
                        break;
                    case 37:
                        self.deserializePlayerEntity(view);
                        break;
                    case 38:
                        self.deserializeProjectileEntity(view);
                        break;
                }
            } else if (typeof data === "string" && data.startsWith("{")) {
                self.handleIncomingJSON(JSON.parse(data));
            }
        });

        self.socket.addEventListener("close", () => {
            self.renderingAgent.camera.disconnected = true;
        })
    }

    handleIncomingJSON(json) {
        const self = this;

        if (json.name === "welcome") {
            json.data = json.data || {};
            json.data.game_width = json.data.game_width || 256;
            json.data.game_height = json.data.game_height || 256;
            json.data.chunk_width = json.data.chunk_width || 64;

            let gameWidth = json.data.game_width;
            let gameHeight = json.data.game_height;
            let chunkWidth = json.data.chunk_width;
            self.game = new Game(gameWidth, gameHeight, chunkWidth);

            self.socket.send(JSON.stringify({
                "name": "enter"
            }));
        } else if (json.name === "entered") {
            self.pinger = new PingMeasurer(self.socket, self);

            json.data = json.data || {};
            json.data.id = json.data.id || 0;

            self.playerId = json.data.id;
            self.player = new PlayerEntity(new Vector2(), new Vector2(), self.game, {
                name: json.data.player_name || -1,
                id: json.data.id
            });

            self.players[self.playerId] = self.player;

            self.renderingAgent = new RenderingAgent(self, document.getElementById("canvas"));
            self.renderingAgent.beginRender();

            self.inputAgent = new InputAgent(self);
        } else if (json.name === "player_name") {
            if (self.players[json.data.id]) {
                self.players[json.data.id].name = json.data.name;
            }
        } else if (json.name === "player_gone") {
            if (self.players[json.data.id]) {
                self.players[json.data.id].destroy();
                self.players[json.data.id] = undefined;
            }
        }
    }

    deserializeCircleObstacle(view) {
        const self = this;

        return new CircleObstacle(new Vector2(view.getUint8(1), view.getUint8(2)), self.game,
            {radius: view.getUint8(3)});
    }

    deserializePlayerEntity(view) {
        const self = this;

        let x = view.getFloat32(1);
        let y = view.getFloat32(5);
        let vx = view.getFloat32(9);
        let vy = view.getFloat32(13);
        let ax = view.getFloat32(17);
        let ay = view.getFloat32(21);
        let r = view.getUint8(25);
        let hp = view.getFloat32(26);
        let dead = view.getUint8(30) === 1;
        let id = view.getUint8(31);

        if (!self.players[id]) {
            self.players[id] = new PlayerEntity(new Vector2(x, y), new Vector2(vx, vy), self.game, {
                radius: r,
                hp: hp,
                id: id,
                disableDeathCheck: true,
                name: -1
            });
        }
        self.players[id].moveTo(new Vector2(x, y));
        self.players[id].velocity.x = vx;
        self.players[id].velocity.y = vy;
        self.players[id].movementAcceleration.x = ax;
        self.players[id].movementAcceleration.y = ay;
        self.players[id].radius = r;
        self.players[id].dead = dead;
        self.players[id].hp = hp;

        if (self.players[id].name === -1) {
            self.socket.send(JSON.stringify({
                name: "get_name",
                data: {
                    id: id
                }
            }))
        }
    }

    deserializeProjectileEntity(view) {
        const self = this;

        let isConfirmation = view.byteLength === 19;

        let x = view.getFloat32(1);
        let y = view.getFloat32(5);
        let vx = view.getFloat32(9);
        let vy = view.getFloat32(13);
        let bounces = view.getUint8(17);
        if (!isConfirmation) {
            let projectile = new ProjectileEntity(new Vector2(x, y), new Vector2(vx, vy), self.game, {
                color: self.player.color
            });
            projectile.bounces = bounces;
        } else {
            let confirmationId = view.getUint8(18);
            let projectile = self.projectileConfirmations[confirmationId];
            if (self.projectileConfirmations[confirmationId]) {
                projectile.position.x = x;
                projectile.position.y = y;
                projectile.velocity.x = vx;
                projectile.velocity.y = vy;
                projectile.bounces = bounces;
                self.projectileConfirmations[confirmationId] = undefined;
            }
        }
    }

    move(directions) {
        const self = this;

        let msg = new ArrayBuffer(2);
        let view = new DataView(msg);
        view.setUint8(0, 223);
        let movementInt = 0;
        if (directions.right) movementInt += 1;
        if (directions.left) movementInt += 2;
        if (directions.up) movementInt += 4;
        if (directions.down) movementInt += 8;
        view.setUint8(1, movementInt);
        self.socket.send(msg);

        if (self.lagCompensationMode === "one way") {
            setTimeout(() => {
                if (directions.right - directions.left || directions.down - directions.up) {
                    let dir = Math.atan2(directions.down - directions.up, directions.right - directions.left);
                    self.player.movementAcceleration.x = 30 * Math.cos(dir);
                    self.player.movementAcceleration.y = 30 * Math.sin(dir);
                } else {
                    self.player.movementAcceleration.x = 0;
                    self.player.movementAcceleration.y = 0;
                }
            }, pingMeasurement);
        }
    }

    fire(angle) {
        const self = this;

        let angleInt = Math.round(angle / 2 / Math.PI * 65536) % 65536;
        angle = angleInt / 65536 * Math.PI * 2;

        let confirmationId = self._confirmProjectile({
            position: new Vector2(),
            bounces: 0,
            velocity: new Vector2()
        });

        let msg;

        if (self.lagCompensationMode === "one way") {
            msg = new ArrayBuffer(4);
            let view = new DataView(msg);
            view.setUint8(0, 224);
            view.setUint16(1, angleInt);
            view.setUint8(3, confirmationId);
        } else {
            msg = new ArrayBuffer(3);
            let view = new DataView(msg);
            view.setUint8(0, 224);
            view.setUint16(1, angleInt);
        }

        self.socket.send(msg);

        if (self.lagCompensationMode === "one way") {
            setTimeout(() => {
                self.projectileConfirmations[confirmationId] = self.player.fire(angle, 30, 0.25);
            }, pingMeasurement);
        }
    }

    _confirmProjectile(projectile) {
        const self = this;

        for (let x=0; x<256; x++) {
            if (typeof self.projectileConfirmations[x] === "undefined") {
                self.projectileConfirmations[x] = projectile;
                return x;
            }
        }
        return -1;
    }

}