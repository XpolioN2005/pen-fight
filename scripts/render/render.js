const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

    // Example object
let ball = { x: 100, y: 100, r: 20, vx: 2, vy: 3 };

function gameLoop() {
      // clear screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

      // update
    ball.x += ball.vx;
    ball.y += ball.vy;

      // bounce off edges
    if (ball.x - ball.r < 0 || ball.x + ball.r > canvas.width) ball.vx *= -1;
    if (ball.y - ball.r < 0 || ball.y + ball.r > canvas.height) ball.vy *= -1;

      // draw
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fillStyle = "cyan";
    ctx.fill();

    requestAnimationFrame(gameLoop);
}

gameLoop();