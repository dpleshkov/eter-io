class InputAgent {
    constructor(multiplayerAgent) {
        const self = this;

        self.multiplayerAgent = multiplayerAgent;

        self.movement = {
            up: 0,
            down: 0,
            left: 0,
            right: 0
        };

        self.mousePosition = {
            x: 0,
            y: 0
        }

        document.addEventListener("mousemove", (evt) => {
            self.mousePosition.x = evt.pageX;
            self.mousePosition.y = evt.pageY;
        }, false);

        let fireEvent = (evt) => {
            let cx = window.innerWidth / 2;
            let cy = window.innerHeight / 2;
            let angle = Math.atan2(self.mousePosition.y - cy, self.mousePosition.x - cx);

            self.multiplayerAgent.fire(angle);
        }

        document.addEventListener("click", fireEvent);

        document.addEventListener("keydown", (evt) => {
            const self = this;

            if (evt.code === "KeyW") {
                self.movement.up = 1;
            } else if (evt.code === "KeyS") {
                self.movement.down = 1;
            } else if (evt.code === "KeyA") {
                self.movement.left = 1;
            } else if (evt.code === "KeyD") {
                self.movement.right = 1;
            }

            self.multiplayerAgent.move(self.movement);
        });

        document.addEventListener("keyup", (evt) => {
            const self = this;

            if (evt.code === "KeyW") {
                self.movement.up = 0;
            } else if (evt.code === "KeyS") {
                self.movement.down = 0;
            } else if (evt.code === "KeyA") {
                self.movement.left = 0;
            } else if (evt.code === "KeyD") {
                self.movement.right = 0;
            } else if (evt.code === "Space") {
                fireEvent(evt);
                return;
            }

            self.multiplayerAgent.move(self.movement);
        });
    }
}