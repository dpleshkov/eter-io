class PlayerEntity {
    constructor(x, y, r, game, name, color="#d26060") {
        const self = this;

        self.x = x;
        self.y = y;
        self.vx = 0;
        self.vy = 0;
        self.r = 0;
        self.name = name;
        self.game = game;
    }

    draw(camera) {
        const self = this;

        // Tick


        // Render

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