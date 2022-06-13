class Camera {
    constructor(canvas, game) {
        const self = this;
        self.canvas = canvas;
        self.ctx = canvas.getContext("2d");
        self.x = 0;
        self.y = 0;
        self.vx = 0;
        self.vy = 0;
        self.lastMoved = Date.now();
        self.fov = 64;
        self.game = game;

        self.scale = self.canvas.width < self.canvas.height ? self.canvas.height / self.fov : self.canvas.width / self.fov;

        self.tracking = self;

        self.resize();
    }

    resize() {
        const self = this;

        self.canvas.setAttribute("width", String(window.innerWidth*2));
        self.canvas.setAttribute("height", String(window.innerHeight*2));
        self.canvas.style.width = (window.innerWidth) + "px";
        self.canvas.style.height = (window.innerHeight) + "px";
        self.fov = 64;

        self.scale = self.canvas.width < self.canvas.height ? self.canvas.height / self.fov : self.canvas.width / self.fov;
        console.log(self.scale);
    }

    move(x, y) {
        const self = this;
        self.x += x;
        self.y += y;
    }

    moveTo(x, y) {
        const self = this;
        self.x = x;
        self.y = y;
    }

    render() {
        const self = this;

        self.moveTo(self.tracking.x, self.tracking.y);

        let now = Date.now();
        let dt = ((now - self.lastMoved)/1000);


        self.move(dt * self.vx, dt * self.vy);
        self.lastMoved = now;

        self.ctx.fillStyle = "#121212";
        self.ctx.fillRect(0, 0, self.canvas.width, self.canvas.height);

        self.drawLine(0, 0, 0, self.game.height);
        self.drawLine(0, 0, self.game.width, 0);
        self.drawLine(self.game.width, 0, self.game.width, self.game.height);
        self.drawLine(0, self.game.height, self.game.width, self.game.height);

        let obstacles = self.game.lookup("CircleObstacle", self.x, self.y, self.fov);
        for (let obstacle of obstacles) {
            obstacle.draw(self);
        }

        let players = self.game.lookup("PlayerEntity", self.x, self.y, self.fov);
        for (let player of players) {
            player.draw(self);
        }

        let projectiles = self.game.lookup("ProjectileEntity", self.x, self.y, self.fov);
        for (let projectile of projectiles) {
            projectile.draw(self);
        }

        requestAnimationFrame(() => {
            self.render();
        });
    }

    drawLine(x1, y1, x2, y2) {
        const self = this;

        let a1 = (self.canvas.width / 2) + ((x1 - self.x) * camera.scale);
        let b1 = (self.canvas.height / 2) + ((y1 - self.y) * camera.scale);
        let a2 = (self.canvas.width / 2) + ((x2 - self.x) * camera.scale);
        let b2 = (self.canvas.height / 2) + ((y2 - self.y) * camera.scale);

        self.ctx.beginPath();
        self.ctx.strokeStyle = "#ffffff";
        self.ctx.moveTo(a1, b1);
        self.ctx.lineTo(a2, b2);
        self.ctx.stroke();
    }
}