if (typeof require !== "undefined" && typeof global !== "undefined") {
    global.Vector2 = require("./Vector2").Vector2;
}

class Camera {
    constructor(canvas, game) {
        const self = this;
        self.canvas = canvas;
        self.ctx = canvas.getContext("2d");
        self.position = new Vector2();
        self.velocity = new Vector2();

        self.lastMoved = Date.now();
        self.fov = 64;
        self.game = game;

        self.scale = self.canvas.width < self.canvas.height ? self.canvas.height / self.fov : self.canvas.width / self.fov;

        self.tracking = self;

        self.disconnected = false;

        self.resize();
    }

    resize() {
        const self = this;

        self.canvas.setAttribute("width", String(window.innerWidth*2));
        self.canvas.setAttribute("height", String(window.innerHeight*2));
        self.canvas.style.width = (window.innerWidth) + "px";
        self.canvas.style.height = (window.innerHeight) + "px";

        self.scale = self.canvas.width < self.canvas.height ? self.canvas.height / self.fov : self.canvas.width / self.fov;
    }

    move(displacement = new Vector2()) {
        const self = this;
        self.position.add(displacement);
    }

    moveTo(position = new Vector2()) {
        const self = this;
        self.position = position;
    }

    render() {
        const self = this;

        if (self.disconnected) {
            self.ctx.fillStyle = "#121212";
            self.ctx.fillRect(0, 0, self.canvas.width, self.canvas.height);
            self.ctx.beginPath();
            self.ctx.textAlign = "center";
            self.ctx.font = `${0.5 * self.scale}px Helvetica Neue`;
            self.ctx.fillStyle = "#ffffff";
            self.ctx.fillText("Connection Lost", self.canvas.width / 2, self.canvas.height / 2);
            return;
        }

        let t1 = Date.now();

        self.moveTo(self.tracking.position.clone());

        let now = Date.now();
        let dt = ((now - self.lastMoved)/1000);


        self.move(self.velocity);
        self.lastMoved = now;

        self.ctx.fillStyle = "#121212";
        self.ctx.fillRect(0, 0, self.canvas.width, self.canvas.height);

        for (let x = 0; x <= self.game.width/self.game.chunkSize; x++) {
            let color = (x === 0 || x === self.game.width / self.game.chunkSize) ? "#ffffff" : "#99AAB5";
            self.drawLine(x * self.game.chunkSize, 0, x * self.game.chunkSize, self.game.height, color, 1/self.scale);
        }
        for (let y = 0; y <= self.game.height/self.game.chunkSize; y++) {
            let color = (y === 0 || y === self.game.width / self.game.chunkSize) ? "#ffffff" : "#99AAB5";
            self.drawLine(0, y * self.game.chunkSize, self.game.width, y * self.game.chunkSize, color, 1/self.scale);
        }

        /*self.drawLine(0, 0, 0, self.game.height);
        self.drawLine(0, 0, self.game.width, 0);
        self.drawLine(self.game.width, 0, self.game.width, self.game.height);
        self.drawLine(0, self.game.height, self.game.width, self.game.height);*/

        let obstacles = self.game.lookup("CircleObstacle", self.position, self.fov);
        for (let obstacle of obstacles) {
            obstacle.draw(self);
            obstacle.tick();
        }

        let players = self.game.lookup("PlayerEntity", self.position, self.fov);
        for (let player of players) {
            player.draw(self);
            player.tick();
        }

        let projectiles = self.game.lookup("ProjectileEntity", self.position, self.fov * 4);
        for (let projectile of projectiles) {
            projectile.draw(self);
            projectile.tick();
        }

        let t2 = Date.now();
        let mspt = t2 - t1;

        self.ctx.beginPath();
        self.ctx.textAlign = "left";
        self.ctx.font = `${0.5 * self.scale}px Helvetica Neue`;
        self.ctx.fillStyle = "#ffffff";
        self.ctx.fillText(`MSPT: ${mspt}`, self.scale/2, self.scale);
        self.ctx.fillText(`Ping: ${window.pingMeasurement} ms`, self.scale/2, 2*self.scale);

        requestAnimationFrame(() => {
            self.render();
        });
    }

    drawLine(x1, y1, x2, y2, color="#ffffff", width = 1) {
        const self = this;

        let a1 = (self.canvas.width / 2) + ((x1 - self.position.x) * self.scale);
        let b1 = (self.canvas.height / 2) + ((y1 - self.position.y) * self.scale);
        let a2 = (self.canvas.width / 2) + ((x2 - self.position.x) * self.scale);
        let b2 = (self.canvas.height / 2) + ((y2 - self.position.y) * self.scale);

        self.ctx.beginPath();
        self.ctx.strokeStyle = color;
        self.ctx.lineWidth = width * self.scale;
        self.ctx.moveTo(a1, b1);
        self.ctx.lineTo(a2, b2);
        self.ctx.stroke();
    }

    toCanvasCoords(position = new Vector2()) {
        const self = this;

        let c = position.clone();
        c.x = (self.canvas.width / 2) + ((c.x - self.position.x) * self.scale);
        c.y = (self.canvas.height / 2) + ((c.y - self.position.y) * self.scale);

        return c;
    }

    drawCircle(position = new Vector2(), color = "#ffffff", radius = 1) {
        const self = this;

        let c = self.toCanvasCoords(position);

        self.ctx.beginPath();
        self.ctx.fillStyle = color;
        self.ctx.arc(c.x, c.y, radius * self.scale, 0, 2*Math.PI);
        self.ctx.fill();
    }
}

if (typeof module !== "undefined") {
    module.exports.Camera = Camera;
}