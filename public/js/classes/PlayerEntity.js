class PlayerEntity {
    constructor(x, y, r, game, name, color="#d26060") {
        const self = this;

        self.x = x;
        self.y = y;
        self.vx = 0;
        self.vy = 0;
        self.r = r;
        self.color = color;
        self.name = name;
        self.game = game;
        self.ci = `${self.x - self.x % 64},${self.y - self.y % 64}`;
        self.lastMoved = Date.now();
    }

    tick() {
        const self = this;

        let now = Date.now();
        let dt = ((now - self.lastMoved)/1000);

        let nextPosition = new Vector(self.x + dt * self.vx, self.y + dt * self.vy);

        let colliders = self.game.lookup("CircleObstacle", self.x, self.y, 32);
        for (let obstacle of colliders) {
            if (Util.distance(nextPosition, obstacle) <= self.r + obstacle.r) {
                // So our circles are colliding.
                // Let's find snap point and tangent velocity

                let adjustAngle = Math.atan2(obstacle.y - nextPosition.y, obstacle.x - nextPosition.x); // POSSIBLE ERROR
                let adjustDistance = (obstacle.r + self.r) - (Util.distance(nextPosition, obstacle));

                // Adjust nextPosition

                nextPosition.x -= adjustDistance * Math.cos(adjustAngle);
                nextPosition.y -= adjustDistance * Math.sin(adjustAngle);
            }
        }

        if (nextPosition.x - self.r < 0) nextPosition.x = self.r;
        if (nextPosition.x + self.r > self.game.width) nextPosition.x = self.game.width - self.r;
        if (nextPosition.y - self.r < 0) nextPosition.y = self.r;
        if (nextPosition.y + self.r > self.game.height) nextPosition.y = self.game.height - self.r;

        self.x = nextPosition.x;
        self.y = nextPosition.y;

        // Update chunk residency if moved

        let newCi = `${self.x - self.x % 64},${self.y - self.y % 64}`;
        if (newCi !== self.ci) {
            self.game.chunks[self.ci].remove(self);
            self.game.chunks[newCi].add(self);
        }
        self.ci = newCi;

        self.lastMoved = Date.now();
    }

    draw(camera) {
        const self = this;

        let dx = self.x - camera.x;
        let dy = self.y - camera.y;
        let cx = camera.canvas.width / 2;
        let cy = camera.canvas.height / 2;
        dx = dx * camera.scale;
        dy = dy * camera.scale;
        camera.ctx.beginPath();
        console.log(self.color);
        camera.ctx.fillStyle = self.color;
        camera.ctx.arc(cx + dx, cy + dy, self.r * camera.scale, 0, 2 * Math.PI);
        camera.ctx.fill();

        // Render name
        camera.ctx.textAlign = "center";
        camera.ctx.font = `${0.5 * camera.scale}px Helvetica Neue`;
        camera.ctx.fillText(self.name, cx + dx, cy + dy + (self.r * camera.scale) + camera.scale);

        self.tick();
    }
}