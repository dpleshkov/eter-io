class PlayerEntity extends Entity {
    constructor(position = new Vector2(), velocity = new Vector2(), game = new Game(), options = {}) {
        super(position, velocity, game);
        const self = this;

        self.radius = options.radius || 1;
        self.color = options.color || "#e86a6a";
        self.name = options.name || "Player";

        self.movementAcceleration = options.movementAcceleration || new Vector2();
        self.friction = options.friction || 0;
        self.maxSpeed = options.maxSpeed || 10;
        self.apparentVelocity = new Vector2();
        self.lastMoved = Date.now();
    }

    _register() {
        if (window.DEBUG) console.log("PlayerEntity::_register called");
        super._register();
    }

    get mass() {
        const self = this;
        return Math.PI * self.radius * self.radius;
    }

    // DECREPIT
    resolveCollisions(obstacles = new Set(), nextPosition = new Vector2()) {
        const self = this;

        let tangents = [];
        for (let obstacle of obstacles) {
            let position = nextPosition.clone();
            let adjustAngle = Math.atan2(obstacle.position.y - nextPosition.y, obstacle.position.x - nextPosition.x); // POSSIBLE ERROR
            let adjustDistance = (obstacle.radius + self.radius) - (nextPosition.distanceTo(obstacle.position));
            position.x -= adjustDistance * Math.cos(adjustAngle);
            position.y -= adjustDistance * Math.sin(adjustAngle);
            let tangent = position.clone();
            tangent.x += self.radius * Math.cos(adjustAngle);
            tangent.y += self.radius * Math.sin(adjustAngle);
            tangents.push({
                tangent: tangent,
                position: position
            });
        }
        if (tangents.length === 1) {
            return tangents[0].position;
        }
        let circles = Util.circleGivenTangentPoints(tangents[0].tangent, tangents[1].tangent, self.radius);

        return circles[0].distanceTo(nextPosition) < circles[1].distanceTo(nextPosition) ? circles[0] : circles[1];
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

            /*
            // Adjust nextVelocity
            let normal = adjustAngle;
            let incoming = nextVelocity.direction;
            let outgoing = 2 * normal - Math.PI - incoming;

            // let deltaV = 2 * nextVelocity.magnitude * Math.sin((adjustAngle + Math.PI / 2));

            //nextVelocity.x = currentSpeed * Math.cos(outgoing) * 0.8;
            //nextVelocity.y = currentSpeed * Math.sin(outgoing) * 0.8;*/
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

        let nextVelocity = self.velocity.clone();

        let relativeMovement = self.velocity.clone().rotateAround(new Vector2(), -self.velocity.angle());
        let relativeAcceleration = self.movementAcceleration.clone().rotateAround(new Vector2(), -nextVelocity.angle()).multiplyScalar(dt);

        if (relativeMovement.x < self.maxSpeed) relativeMovement.x += relativeAcceleration.x;
        relativeMovement.y += relativeAcceleration.y;

        relativeMovement.rotateAround(new Vector2(), self.velocity.angle());

        nextVelocity = relativeMovement;


        /*if (self.velocity.length() < self.maxSpeed) {
            nextVelocity = self.velocity.clone().add(self.movementAcceleration.clone().multiplyScalar(dt));
        }*/
        //let nextVelocity = self.velocity.clone().add(self.movementAcceleration.clone().multiplyScalar(dt));
        let speed = nextVelocity.length();
        let speedReduction = self.friction * dt;
        if (speed > 0 && self.movementAcceleration.length() === 0) {
            if (speed < speedReduction) {
                nextVelocity.x = 0;
                nextVelocity.y = 0;
            } else {
                nextVelocity.normalize().multiplyScalar(speed - speedReduction);
            }
        }
        speed = nextVelocity.length();

        let nextPosition = self.position.clone().add(new Vector(dt * nextVelocity.x, dt * nextVelocity.y));
        let currentSpeed = nextVelocity.length();

        let colliders = new Set([
            ...self.game.lookup("CircleObstacle", self.position, 32),
            //...self.game.lookup("ProjectileEntity", self.position.x, self.position.y, 32)
        ]);

        //let collisions = new Set();
        for (let obstacle of colliders) {
            if (obstacle.position.distanceTo(nextPosition) <= self.radius + obstacle.radius) {
                let collision = self.resolveCollision(obstacle, nextPosition, nextVelocity, currentSpeed);
                nextPosition = collision.position;
                nextVelocity = collision.velocity;
                //collisions.add(obstacle);
            }
        }

        //if (collisions.size > 0) nextPosition = self.resolveCollisions(collisions, nextPosition);

        if (nextPosition.x - self.radius < 0) {
            nextPosition.x = self.radius;
            //nextVelocity.x = -nextVelocity.x;
        }
        if (nextPosition.x + self.radius > self.game.width) {
            nextPosition.x = self.game.width - self.radius;
            //nextVelocity.x = -nextVelocity.x;
        }
        if (nextPosition.y - self.radius < 0) {
            nextPosition.y = self.radius;
            //nextVelocity.y = -nextVelocity.y;
        }
        if (nextPosition.y + self.radius > self.game.height) {
            nextPosition.y = self.game.height - self.radius;
            //nextVelocity.y = -nextVelocity.y;
        }

        self.apparentVelocity = nextPosition.clone().sub(self.position).multiplyScalar(1/dt);
        self.moveTo(nextPosition);
        //self.x = nextPosition.x;
        //self.y = nextPosition.y;
        self.velocity = self.apparentVelocity.clone();

        //self.vx = nextVelocity.x;
        //self.vy = nextVelocity.y;

        // Update chunk residency if moved

        /*let newCi = `${self.x - self.x % 64},${self.y - self.y % 64}`;
        if (newCi !== self.ci) {
            self.game.chunks[self.ci].remove(self);
            self.game.chunks[newCi].add(self);
        }
        self.ci = newCi;*/

        self.lastMoved = Date.now();
    }

    fire(direction = 0, speed = 10, radius= 0.5) {
        const self = this;

        let dx = self.position.x + ((self.radius + radius) * Math.cos(direction));
        let dy = self.position.y + ((self.radius + radius) * Math.sin(direction));
        let vx = speed * Math.cos(direction);
        let vy = speed * Math.sin(direction);

        let position = new Vector2(dx, dy);
        let velocity = new Vector2(vx, vy);
        velocity.add(self.velocity);

        return new ProjectileEntity(position, velocity, self.game, {
            color: self.color,
            radius: radius
        });


    }

    draw(camera) {
        const self = this;

        let dx = self.position.x - camera.position.x;
        let dy = self.position.y - camera.position.y;
        let cx = camera.canvas.width / 2;
        let cy = camera.canvas.height / 2;
        dx = dx * camera.scale;
        dy = dy * camera.scale;

        camera.drawCircle(self.position, self.color, self.radius);

        // Render name
        camera.ctx.beginPath();
        camera.ctx.textAlign = "center";
        camera.ctx.font = `${0.5 * camera.scale}px Helvetica Neue`;
        camera.ctx.fillText(self.name, cx + dx, cy + dy + (self.radius * camera.scale) + camera.scale);

    }
}