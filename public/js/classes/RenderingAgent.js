class RenderingAgent {
    constructor(multiplayerAgent, canvas) {
        const self = this;

        self.multiplayerAgent = multiplayerAgent;
        self.canvas = canvas;
        self.game = self.multiplayerAgent.game;
        self.camera = new Camera(self.canvas, self.game);
        self.camera.tracking = self.multiplayerAgent.player;

        window.addEventListener("resize", () => {
            self.camera.resize();
        })

        self.rendering = false;
    }

    beginRender() {
        const self = this;

        if (!self.rendering) {
            self.rendering = true;
            self._tick();

        }
    }

    stopRender() {
        const self = this;

        self.rendering = false;
    }

    _tick() {
        const self = this;

        if (self.rendering) {
            requestAnimationFrame(() => {
                self.camera.render();
                self._tick();
            });
        }
    }

}