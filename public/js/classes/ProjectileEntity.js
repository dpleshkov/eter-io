class ProjectileEntity extends Entity {
    constructor(position = new Vector2(), velocity = new Vector2(), game = new Game(), options = {}) {
        super(position, velocity, game);
        const self = this;

        console.log(this);

        self.radius = options.radius || 0.25;
        self.color = options.color || "#ffffff";

        self.speed = velocity.length();
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

            let adjustAngle = Math.atan2(obstacle.position.y - nextPosition.y, obstacle.position.x - nextPosition.x); // POSSIBLE ERROR
            let adjustDistance = (obstacle.radius + self.radius) - (nextPosition.distanceTo(obstacle.position));

            // Adjust nextPosition

            nextPosition.x -= adjustDistance * Math.cos(adjustAngle);
            nextPosition.y -= adjustDistance * Math.sin(adjustAngle);

            // Adjust nextVelocity
            let normal = adjustAngle;
            let incoming = nextVelocity.direction;
            let outgoing = 2 * normal - Math.PI - incoming;

            // let deltaV = 2 * nextVelocity.magnitude * Math.sin((adjustAngle + Math.PI / 2));

            //nextVelocity.x = currentSpeed * Math.cos(outgoing) * 0.8;
            //nextVelocity.y = currentSpeed * Math.sin(outgoing) * 0.8;
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

        let nextPosition = self.position.clone().add(new Vector(dt * self.velocity.x, dt * self.velocity.y));
        let nextVelocity = self.velocity.clone();

        let possibleCollisions = new Set([
            ...self.game.lookup("CircleObstacle", self.position, 32),
            //...self.game.lookup("PlayerEntity", self.x, self.y, 32)
        ]);

        for (let obstacle of possibleCollisions) {
            if (obstacle.position.distanceTo(self.position) <= self.radius + obstacle.radius) {
                console.log("collission ")

                let collision = self.resolveCollision(obstacle, nextPosition, nextVelocity, self.speed);
                nextPosition = collision.position;
                nextVelocity = collision.velocity;

                /*// So our circles are colliding.
                // Let's find snap point and tangent velocity

                let adjustAngle = Math.atan2(obstacle.position.y - nextPosition.y, obstacle.position.x - nextPosition.x); // POSSIBLE ERROR
                let adjustDistance = (obstacle.radius + self.radius) - (nextPosition.distanceTo(obstacle.position));

                // Adjust nextPosition

                nextPosition.x -= adjustDistance * Math.cos(adjustAngle);
                nextPosition.y -= adjustDistance * Math.sin(adjustAngle);

                // Adjust nextVelocity

                /*let normal = adjustAngle;
                let incoming = nextVelocity.angle();
                let outgoing = 2 * normal - Math.PI - incoming;

                // let deltaV = 2 * nextVelocity.magnitude * Math.sin((adjustAngle + Math.PI / 2));

                nextVelocity.x = self.speed * Math.cos(outgoing);
                nextVelocity.y = self.speed * Math.sin(outgoing);*/
            }
        }

        if (nextPosition.x - self.radius < 0) {
            nextPosition.x = self.radius;
            nextVelocity.x = -nextVelocity.x;
        }
        if (nextPosition.x + self.radius > self.game.width) {
            nextPosition.x = self.game.width - self.radius;
            nextVelocity.x = -nextVelocity.x;
        }
        if (nextPosition.y - self.radius < 0) {
            nextPosition.y = self.radius;
            nextVelocity.y = -nextVelocity.y;
        }
        if (nextPosition.y + self.radius > self.game.height) {
            nextPosition.y = self.game.height - self.radius;
            nextVelocity.y = -nextVelocity.y;
        }

        self.moveTo(nextPosition);
        self.velocity = nextVelocity;

        // Update chunk residency if moved

        self.lastMoved = Date.now();
    }

    draw(camera) {
        console.log("Projectile draw called");
        const self = this;

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