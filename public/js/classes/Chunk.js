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

if (typeof module !== "undefined") {
    module.exports.Chunk = Chunk;
}