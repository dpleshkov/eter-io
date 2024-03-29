if (typeof require !== "undefined" && typeof global !== "undefined") {
    global.Vector2 = require("./Vector2").Vector2;
    global.Game = require("./Game").Game;
    global.Entity = require("./Entity").Entity;
}

class ProjectileEntity extends Entity {
    constructor(position = new Vector2(), velocity = new Vector2(), game = new Game(), options = {}) {
        super(position, velocity, game);
        const self = this;

        self.radius = options.radius || 0.25;
        self.color = options.color || "#ffffff";

        self.speed = velocity.length();
        self.lastMoved = Date.now();

        self.bounces = 0;
        self.maxBounces = options.maxBounces || 1;
        self.destroyOnNextTick = false;

        self.lifespan = options.lifespan || -1;
        self.created = Date.now();

        self.sentTo = options.sentTo || new Set();
    }

    get mass() {
        const self = this;
        return Math.PI * self.r * self.r;
    }

    resolveCollision(obstacle, nextPosition, nextVelocity, currentSpeed) {
        const self = this;

        let position = nextPosition.clone();
        let velocity = nextVelocity.clone();

        if (obstacle.constructor.name === "CircleObstacle") {
            // So our circles are colliding.
            // Let's find snap point and tangent velocity

            let adjustAngle = Math.atan2(obstacle.position.y - nextPosition.y, obstacle.position.x - nextPosition.x); // POSSIBLE ERROR
            let adjustDistance = (obstacle.radius + self.radius) - (nextPosition.distanceTo(obstacle.position));

            // Adjust nextPosition

            position.x -= adjustDistance * Math.cos(adjustAngle);
            position.y -= adjustDistance * Math.sin(adjustAngle);

            // Adjust nextVelocity
            let normal = adjustAngle;
            let incoming = nextVelocity.angle();
            let outgoing = 2 * normal - Math.PI - incoming;

            // let deltaV = 2 * nextVelocity.magnitude * Math.sin((adjustAngle + Math.PI / 2));

            velocity.x = currentSpeed * Math.cos(outgoing) * 1;
            velocity.y = currentSpeed * Math.sin(outgoing) * 1;

        } else if (obstacle.constructor.name === "PlayerEntity") {
            let angleToPlayer = obstacle.position.clone().sub(self.position).angle();
            let relativeVelocity = nextVelocity.clone().sub(obstacle.velocity);

            let relativeSpeedToTarget = relativeVelocity.clone().rotateAround(new Vector2(), -angleToPlayer).x;
            if (relativeSpeedToTarget > 0) {
                obstacle.hp -= relativeSpeedToTarget * obstacle.damageMultiplier;
            }
            self.destroy();

        }
        return {
            position: position,
            velocity: velocity
        }
    }

    tick() {
        const self = this;
        if (self.destroyed) return;

        if (self.destroyOnNextTick || (self.lifespan !== -1 && Date.now() - self.created >= self.lifespan)) {
            self.destroy();
            return;
        }

        let now = Date.now();
        let dt = ((now - self.lastMoved)/1000);

        let nextPosition = self.position.clone().add(new Vector2(dt * self.velocity.x, dt * self.velocity.y));
        let nextVelocity = self.velocity.clone();
        let currentSpeed = nextVelocity.length();

        let possibleCollisions = new Set([
            ...self.game.lookup("CircleObstacle", self.position, 32),
            ...self.game.lookup("PlayerEntity", self.position, 32)
        ]);

        for (let obstacle of possibleCollisions) {
            if (obstacle.position.distanceTo(nextPosition) <= self.radius + obstacle.radius) {

                let collision = self.resolveCollision(obstacle, nextPosition, nextVelocity, self.speed);
                nextPosition = collision.position;
                nextVelocity = collision.velocity;

                if (obstacle.constructor.name === "CircleObstacle") {
                    self.bounces += 1;
                }
            }
        }

        if (nextPosition.x - self.radius < 0) {
            nextPosition.x = self.radius;
            nextVelocity.x = -nextVelocity.x;
            self.bounces++;
        }
        if (nextPosition.x + self.radius > self.game.width) {
            nextPosition.x = self.game.width - self.radius;
            nextVelocity.x = -nextVelocity.x;
            self.bounces++;
        }
        if (nextPosition.y - self.radius < 0) {
            nextPosition.y = self.radius;
            nextVelocity.y = -nextVelocity.y;
            self.bounces++;
        }
        if (nextPosition.y + self.radius > self.game.height) {
            nextPosition.y = self.game.height - self.radius;
            nextVelocity.y = -nextVelocity.y;
            self.bounces++;
        }

        if (self.bounces > self.maxBounces) {
            self.destroy();
            return;
            //self.destroyOnNextTick = true;
        }

        self.moveTo(nextPosition);
        self.velocity = nextVelocity;

        // Update chunk residency if moved

        self.lastMoved = Date.now();
    }

    draw(camera) {
        const self = this;
        if (self.destroyed) return;

        let dx = self.position.x - camera.position.x;
        let dy = self.position.y - camera.position.y;
        let cx = camera.canvas.width / 2;
        let cy = camera.canvas.height / 2;
        dx = dx * camera.scale;
        dy = dy * camera.scale;
        camera.ctx.beginPath();
        camera.ctx.fillStyle = self.color;
        camera.ctx.arc(cx + dx, cy + dy, self.radius * camera.scale, 0, 2 * Math.PI);
        camera.ctx.fill();
    }
}

if (typeof module !== "undefined") {
    module.exports.ProjectileEntity = ProjectileEntity;
}