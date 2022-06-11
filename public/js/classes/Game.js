class Chunk {
    constructor() {
        const self = this;
        self.entities = {};
    }

    add(entity) {
        const self = this;
        if (!self.entities[entity.constructor.name]) {
            self.entities[entity.constructor.name] = new Set();
        }
        self.entities[entity.constructor.name].add(entity);
    }

    remove(entity) {
        const self = this;
        if (self.entities[entity.constructor.name]) {
            return self.entities[entity.constructor.name].delete(entity);
        }
        return false;
    }
}

class CircleObstacle {
    constructor(x, y, radius, color="#ffffff") {
        const self = this;
        self.x = x;
        self.y = y;
        self.radius = radius;
        self.color = color;
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
        camera.ctx.arc(cx + dx, cy + dy, self.radius * camera.scale, 0, 2 * Math.PI);
        camera.ctx.fill();
    }
}

class Game {
    constructor() {
        const self = this;
        self.chunks = {};
    }

    register(entity) {
        const self = this;
        let cx = entity.x - entity.x % 64;
        let cy = entity.y - entity.y % 64;
        let ci = `${cx},${cy}`;
        if (!self.chunks[ci]) {
            self.chunks[ci] = new Chunk();
        }
        self.chunks[ci].add(entity);
    }

    // TODO: ensure all entities update chunk residency if moving
    remove(entity) {
        const self = this;
        let cx = entity.x - entity.x % 64;
        let cy = entity.y - entity.y % 64;
        let ci = `${cx},${cy}`;
        if (self.chunks[ci]) {
            self.chunks[ci].remove(entity);
        }
    }

    lookup(className, lx, ly, radius) {
        const self = this;
        let output = new Set();
        for (let x = lx - radius; x <= lx + radius; x += 64) {
            for (let y = ly - radius; y <= ly + radius; y += 64) {
                let cx = x - x % 64;
                let cy = y - y % 64;
                let ci = `${cx},${cy}`;
                if (self.chunks[ci]) {
                    for (let entity of self.chunks[ci].entities[className]) {
                        output.add(entity);
                    }
                }
            }
        }
        return output;
    }
}

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

        let now = Date.now();
        let dt = ((now - self.lastMoved)/1000);


        self.move(dt * self.vx, dt * self.vy);
        self.lastMoved = now;

        self.ctx.fillStyle = "#121212";
        self.ctx.fillRect(0, 0, self.canvas.width, self.canvas.height);

        let obstacles = self.game.lookup("CircleObstacle", self.x, self.y, self.fov);
        for (let obstacle of obstacles) {
            obstacle.draw(self);
        }

        requestAnimationFrame(() => {
            self.render();
        });
    }
}
