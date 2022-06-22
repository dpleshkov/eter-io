if (typeof require !== "undefined" && typeof global !== "undefined") {
    global.Vector2 = require("./Vector2").Vector2;
    global.Entity = require("./Entity").Entity;
}

class CircleObstacle extends Entity {
    constructor(position = new Vector2(), game = new Game(), options={}) {
        super(position, new Vector2(), game);
        const self = this;

        self.radius = options.radius || 1;
        self.color = options.color || "#ffffff";
    }

    draw(camera) {
        const self = this;

        camera.drawCircle(self.position, self.color, self.radius);
    }
}

if (typeof module !== "undefined") {
    module.exports.CircleObstacle = CircleObstacle;
}