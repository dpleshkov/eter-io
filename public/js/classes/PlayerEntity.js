class PlayerEntity {
    constructor(x, y, r, game, name, color="#d26060") {
        const self = this;

        self.x = x;
        self.y = y;
        self.r = r;

        self.vx = 0;
        self.vy = 0;

        self.color = color;
        self.name = name;
        self.game = game;

        self.ci = `${self.x - self.x % 64},${self.y - self.y % 64}`;
        self.lastMoved = Date.now();
    }

    get mass() {
        const self = this;
        return Math.PI * self.r * self.r;
    }

    resolveCollision(obstacle, nextPosition, nextVelocity, currentSpeed) {
        const self = this;

        if (obstacle.constructor.name === "CircleObstacle") {
            // So our circles are colliding.
            // Let's find snap point and tangent velocity

            let adjustAngle = Math.atan2(obstacle.y - nextPosition.y, obstacle.x - nextPosition.x); // POSSIBLE ERROR
            let adjustDistance = (obstacle.r + self.r) - (Util.distance(nextPosition, obstacle));

            // Adjust nextPosition

            nextPosition.x -= adjustDistance * Math.cos(adjustAngle);
            nextPosition.y -= adjustDistance * Math.sin(adjustAngle);

            // Adjust nextVelocity
            let normal = adjustAngle;
            let incoming = nextVelocity.direction;
            let outgoing = 2 * normal - Math.PI - incoming;

            // let deltaV = 2 * nextVelocity.magnitude * Math.sin((adjustAngle + Math.PI / 2));

            nextVelocity.x = currentSpeed * Math.cos(outgoing);
            nextVelocity.y = currentSpeed * Math.sin(outgoing);
        }
        return {
            position: nextPosition,
            velocity: nextVelocity
        }
    }

    tick() {
        const self = this;

        let now = Date.now();
        let dt = ((now - self.lastMoved)/1000);

        let nextPosition = new Vector(self.x + dt * self.vx, self.y + dt * self.vy);
        let nextVelocity = new Vector(self.vx, self.vy);
        let currentSpeed = nextVelocity.magnitude;

        let colliders = new Set([
            ...self.game.lookup("CircleObstacle", self.x, self.y, 32),
            ...self.game.lookup("ProjectileEntity", self.x, self.y, 32)
        ]);

        for (let obstacle of colliders) {
            if (Util.distance(nextPosition, obstacle) <= self.r + obstacle.r) {
                let collision = self.resolveCollision(obstacle, nextPosition, nextVelocity, currentSpeed);
                nextPosition = collision.position;
                nextVelocity = collision.velocity;
            }
        }

        if (nextPosition.x - self.r < 0) {
            nextPosition.x = self.r;
            nextVelocity.x = -nextVelocity.x;
        }
        if (nextPosition.x + self.r > self.game.width) {
            nextPosition.x = self.game.width - self.r;
            nextVelocity.x = -nextVelocity.x;
        }
        if (nextPosition.y - self.r < 0) {
            nextPosition.y = self.r;
            nextVelocity.y = -nextVelocity.y;
        }
        if (nextPosition.y + self.r > self.game.height) {
            nextPosition.y = self.game.height - self.r;
            nextVelocity.y = -nextVelocity.y;
        }

        self.x = nextPosition.x;
        self.y = nextPosition.y;
        self.vx = nextVelocity.x;
        self.vy = nextVelocity.y;

        // Update chunk residency if moved

        let newCi = `${self.x - self.x % 64},${self.y - self.y % 64}`;
        if (newCi !== self.ci) {
            self.game.chunks[self.ci].remove(self);
            self.game.chunks[newCi].add(self);
        }
        self.ci = newCi;

        self.lastMoved = Date.now();
    }

    fire(direction = 0, speed = 15, radius= 0.5) {
        const self = this;

        let dx = self.x + ((self.r + radius) * Math.cos(direction));
        let dy = self.y + ((self.r + radius)) * Math.sin(direction);
        let vx = speed * Math.cos(direction);
        let vy = speed * Math.sin(direction);

        let momentumMultiplier = 5;

        let projectile = new ProjectileEntity(dx, dy, radius, self.vx + vx, self.vy + vy, self.game, self.color);
        let momentum = speed * projectile.mass * momentumMultiplier;


        self.vx -= momentum * Math.cos(direction) / self.mass;
        self.vy -= momentum * Math.sin(direction) / self.mass;
        self.game.register(projectile);


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