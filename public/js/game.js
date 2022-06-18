window.DEBUG = true;

let randint = function(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let canvas = document.getElementById("canvas");

/*canvas.setAttribute("width", String(window.innerWidth*2));
canvas.setAttribute("height", String(window.innerHeight*2));
canvas.style.width = (window.innerWidth) + "px";
canvas.style.height = (window.innerHeight) + "px";*/

let ctx = canvas.getContext("2d");
ctx.fillStyle = "#121212";
ctx.fillRect(0, 0, canvas.width, canvas.height);

let game = new Game();

for (let x = 0; x < 512; x++) {
    new CircleObstacle(new Vector2(randint(3, 253), randint(3, 253)), game, {
        radius: randint(1, 3),
        color: "#ffffff"
    })
}

let camera = new Camera(canvas, game);
let player = new PlayerEntity(new Vector2(32, 32), new Vector2(), game, {
    name: "Player",
    friction: 10,
    maxSpeed: 10
});

camera.tracking = player;
camera.render();

let movement = {
    up: 0,
    down: 0,
    left: 0,
    right: 0
}


/*canvas.addEventListener("mousemove", (evt) => {
    let cx = window.innerWidth / 2;
    let cy = window.innerHeight / 2;

    let angle = Math.atan2(evt.clientY - cy, evt.clientX - cx);

    player.vx = 5*Math.cos(angle);
    player.vy = 5*Math.sin(angle);
});*/

document.addEventListener("keydown", (evt) => {
    if (evt.code === "KeyW") {
        movement.up = 10;
    } else if (evt.code === "KeyS") {
        movement.down = 10;
    } else if (evt.code === "KeyA") {
        movement.left = 10;
    } else if (evt.code === "KeyD") {
        movement.right = 10;
    }
    if (movement.right - movement.left || movement.down - movement.up) {
        let dir = Math.atan2(movement.down - movement.up, movement.right - movement.left);
        player.movementAcceleration.x = 30 * Math.cos(dir);
        player.movementAcceleration.y = 30 * Math.sin(dir);
    } else {
        player.movementAcceleration.x = 0;
        player.movementAcceleration.y = 0;
    }
});

document.addEventListener("keyup", (evt) => {
    if (evt.code === "KeyW") {
        movement.up = 0;
    } else if (evt.code === "KeyS") {
        movement.down = 0;
    } else if (evt.code === "KeyA") {
        movement.left = 0;
    } else if (evt.code === "KeyD") {
        movement.right = 0;
    }
    if (movement.right - movement.left || movement.down - movement.up) {
        let dir = Math.atan2(movement.down - movement.up, movement.right - movement.left);
        player.movementAcceleration.x = 30 * Math.cos(dir);
        player.movementAcceleration.y = 30 * Math.sin(dir);
    } else {
        player.movementAcceleration.x = 0;
        player.movementAcceleration.y = 0;
    }
});

document.addEventListener("click", (evt) => {
    let cx = window.innerWidth / 2;
    let cy = window.innerHeight / 2;

    let angle = Math.atan2(evt.clientY - cy, evt.clientX - cx);

    player.fire(angle, 30, 0.25);
});

window.addEventListener("resize", (evt) => {
    camera.resize();
    //console.log(camera.scale);
});
