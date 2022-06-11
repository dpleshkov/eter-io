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
