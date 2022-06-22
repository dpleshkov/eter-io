window.DEBUG = true;

let movement = {
    up: 0,
    down: 0,
    left: 0,
    right: 0
}

const canvas = document.getElementById("canvas");

let game = new Game(256, 256, 64);
let camera = new Camera(canvas, game);
camera.render();

window.addEventListener("resize", (evt) => {
    camera.resize();
    //console.log(camera.scale);
});

let socket = new WebSocket("ws://dmitry-laptop.local:8080");
let players = [];
let player = new PlayerEntity(new Vector2(128, 128), new Vector2(), game);
camera.tracking = player;

socket.addEventListener("message", async(evt) => {
    let data = evt.data;
    if (typeof data === "object") {
        let buffer = await data.arrayBuffer();
        let view = new DataView(buffer);

        if (view.getUint8(0) === 36) {
            let x = view.getUint8(1);
            let y = view.getUint8(2);
            let r = view.getUint8(3);
            new CircleObstacle(new Vector2(x, y), game, {
                radius: r
            });
        } else if (view.getUint8(0) === 37) {
            let x = view.getFloat32(1);
            let y = view.getFloat32(5);
            let vx = view.getFloat32(9);
            let vy = view.getFloat32(13);
            let ax = view.getFloat32(17);
            let ay = view.getFloat32(21);
            let r = view.getUint8(25);
            let hp = view.getUint8(26);
            let dead = view.getUint8(27) === 1;
            let id = view.getUint8(28);

            if (!players[id]) {
                players[id] = new PlayerEntity(new Vector2(x, y), new Vector2(vx, vy), game, {
                    radius: r,
                    hp: hp,
                    id: id
                });
            }
            players[id].moveTo(new Vector2(x, y));
            players[id].velocity.x = vx;
            players[id].velocity.y = vy;
            players[id].movementAcceleration.x = ax;
            players[id].movementAcceleration.y = ay;
            players[id].radius = r;
            players[id].dead = dead;
        } else if (view.getUint8(0) === 226) {
            let now = Date.now();
            pingMeasurement = now - lastPing;

            setTimeout(() => {
                let msg = new ArrayBuffer(1);
                let view = new DataView(msg);
                view.setUint8(0, 225);
                socket.send(msg);
                lastPing = Date.now();
            }, 250);
        }
    } else if (typeof data === "string" && data.startsWith("{")) {
        let json = JSON.parse(data);
        if (json.joined) {
            player.id = json.joined.id;
            players[json.joined.id] = player;
        }
        let msg = new ArrayBuffer(1);
        let view = new DataView(msg);
        view.setUint8(0, 225);
        socket.send(msg);
        lastPing = Date.now();
    }
});

document.addEventListener("keydown", (evt) => {
    if (evt.code === "KeyW") {
        movement.up = 1;
    } else if (evt.code === "KeyS") {
        movement.down = 1;
    } else if (evt.code === "KeyA") {
        movement.left = 1;
    } else if (evt.code === "KeyD") {
        movement.right = 1;
    }
    let msg = new ArrayBuffer(2);
    let view = new DataView(msg);
    view.setUint8(0, 223);
    let movementInt = 0;
    if (movement.right) movementInt += 1;
    if (movement.left) movementInt += 2;
    if (movement.up) movementInt += 4;
    if (movement.down) movementInt += 8;
    view.setUint8(1, movementInt);
    socket.send(msg);

    setTimeout(() => {
        if (movement.right - movement.left || movement.down - movement.up) {
            let dir = Math.atan2(movement.down - movement.up, movement.right - movement.left);
            player.movementAcceleration.x = 30 * Math.cos(dir);
            player.movementAcceleration.y = 30 * Math.sin(dir);
        } else {
            player.movementAcceleration.x = 0;
            player.movementAcceleration.y = 0;
        }
    }, pingMeasurement);
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
    let msg = new ArrayBuffer(2);
    let view = new DataView(msg);
    view.setUint8(0, 223);
    let movementInt = 0;
    if (movement.right) movementInt += 1;
    if (movement.left) movementInt += 2;
    if (movement.up) movementInt += 4;
    if (movement.down) movementInt += 8;
    view.setUint8(1, movementInt);
    socket.send(msg);

    setTimeout(() => {
        if (movement.right - movement.left || movement.down - movement.up) {
            let dir = Math.atan2(movement.down - movement.up, movement.right - movement.left);
            player.movementAcceleration.x = 30 * Math.cos(dir);
            player.movementAcceleration.y = 30 * Math.sin(dir);
        } else {
            player.movementAcceleration.x = 0;
            player.movementAcceleration.y = 0;
        }
    }, pingMeasurement);
});

let pingMeasurement = 0;
let lastPing = Date.now();
