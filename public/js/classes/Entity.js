if (typeof require !== "undefined" && typeof global !== "undefined") {
    global.Vector2 = require("./Vector2").Vector2;
    global.Game = require("./Game").Game;
}

class Entity {
    constructor(position = new Vector2(), velocity = new Vector2(), game = new Game()) {
        const self = this;

        self.position = position;
        self.velocity = velocity;
        self.game = game;
        self.destroyed = false;

        self._register();
    }

    _register() {
        const self = this;

        let chunkIndex = self.chunkIndex;
        if (!self.game.chunks[chunkIndex]) {
            self.game.chunks[chunkIndex] = new Chunk();
        }
        self.game.chunks[chunkIndex].add(self);
    }

    destroy() {
        const self = this;

        self.game.chunks[self.chunkIndex].remove(self);
        self.destroyed = true;

        delete this;
    }

    move(displacement = new Vector2()) {
        const self = this;

        let oldChunk = self.chunkIndex;
        self.position.add(displacement);
        let newChunk = self.chunkIndex;

        if (newChunk !== oldChunk) {
            self.game.chunks[oldChunk].remove(self);
            self._register();
        }
    }

    moveTo(position = new Vector2()) {
        const self = this;

        let oldChunk = self.chunkIndex;
        self.position = position;
        let newChunk = self.chunkIndex;

        if (newChunk !== oldChunk) {
            self.game.chunks[oldChunk].remove(self);
            self._register();
        }
    }

    tick() {}

    draw() {}

    get chunkIndex() {
        const self = this;

        let cx = self.position.x - self.position.x % self.game.chunkSize;
        let cy = self.position.y - self.position.y % self.game.chunkSize;
        return `${cx},${cy}`;
    }

    get x() {
        const self = this;

        return self.position.x;
    }

    get y() {
        const self = this;

        return self.position.y;
    }

    get vx() {
        const self = this;

        return self.velocity.x;
    }

    get vy() {
        const self = this;

        return self.velocity.y;
    }
}

if (typeof module !== "undefined") {
    module.exports.Entity = Entity;
}