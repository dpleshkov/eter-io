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

        let obstacles = self.game.lookup("CircleObstacle", self.x, self.y, self.fov/2);
        for (let obstacle of obstacles) {
            obstacle.draw(self);
        }

        requestAnimationFrame(() => {
            self.render();
        });
    }
}