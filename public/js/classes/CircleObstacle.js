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