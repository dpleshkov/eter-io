class CircleObstacle extends Entity {
    constructor(position = new Vector2(), game = new Game(), options={}) {
        super(position, new Vector2(), game);
        const self = this;

        self.radius = options.radius || 1;
        self.color = options.color || "#ffffff";
    }

    draw(camera) {
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