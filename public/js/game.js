let randint = function(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let canvas = document.getElementById("canvas");

canvas.setAttribute("width", String(window.innerWidth*2));
canvas.setAttribute("height", String(window.innerHeight*2));
canvas.style.width = (window.innerWidth) + "px";
canvas.style.height = (window.innerHeight) + "px";

let ctx = canvas.getContext("2d");
ctx.fillStyle = "#121212";
ctx.fillRect(0, 0, canvas.width, canvas.height);

let game = new Game();

for (let x = 0; x < 2048; x++) {
    game.register(new CircleObstacle(randint(2, 1022), randint(2, 1022), 2));
}

let camera = new Camera(canvas, game);
camera.moveTo(32, 32);
camera.render();


canvas.addEventListener("mousemove", (evt) => {
    let cx = window.innerWidth / 2;
    let cy = window.innerHeight / 2;

    let angle = Math.atan2(evt.clientY - cy, evt.clientX - cx);

    camera.vx = 5*Math.cos(angle);
    camera.vy = 5*Math.sin(angle);
})