if (typeof require !== "undefined" && typeof global !== "undefined") {
    global.Vector2 = require("./Vector2").Vector2;
    global.Chunk = require("./Chunk").Chunk;
}

class Game {
    constructor(width = 256, height = 256, chunkSize = 64) {
        const self = this;

        self.chunks = {};
        self.width = width;
        self.height = height;
        self.chunkSize = chunkSize;
        self.runningEntityId = 0;
    }

    register(entity = new Entity()) {
        const self = this;

        let cx = entity.position.x - entity.position.x % self.chunkSize;
        let cy = entity.position.y - entity.position.y % self.chunkSize;
        let ci = `${cx},${cy}`;

        if (!self.chunks[ci]) {
            self.chunks[ci] = new Chunk();
        }
        self.chunks[ci].add(entity);
    }

    obtainUniqueEntityId() {
        const self = this;

        self.runningEntityId += 1;
        return self.runningEntityId;
    }

    // TODO: ensure all entities update chunk residency if moving
    remove(entity = new Entity()) {
        const self = this;

        let cx = entity.position.x - entity.position.x % self.chunkSize;
        let cy = entity.position.y - entity.position.y % self.chunkSize;
        let ci = `${cx},${cy}`;
        if (self.chunks[ci]) {
            self.chunks[ci].remove(entity);
        }
    }

    lookup(className = "Entity", position = new Vector2(), radius = 64) {
        const self = this;
        let output = new Set();
        for (let x = position.x - radius; x <= position.x + radius; x += self.chunkSize) {
            for (let y = position.y - radius; y <= position.y + radius; y += self.chunkSize) {
                let cx = x - x % self.chunkSize;
                let cy = y - y % self.chunkSize;
                let ci = `${cx},${cy}`;
                if (self.chunks[ci] && self.chunks[ci].entities[className]) {
                    for (let entity of self.chunks[ci].entities[className]) {
                        output.add(entity);
                    }
                }
            }
        }
        return output;
    }
}

if (typeof module !== "undefined") {
    module.exports.Game = Game;
}
