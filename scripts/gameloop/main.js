const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Create two rigid bodies
const pen1 = new RigidBody(300, 300, 150, 20, 1);
const pen2 = new RigidBody(500, 300, 150, 20, 0.5);

pen1.applyImpulse(1000, 0); // give pen1 some velocity
pen2.angle = 0.5; // rotate pen2 a bit

function drawBody(body, color = "cyan") {
	const verts = body.getVertices();
	ctx.beginPath();
	ctx.moveTo(verts[0].x, verts[0].y);
	for (let i = 1; i < verts.length; i++) {
		ctx.lineTo(verts[i].x, verts[i].y);
	}
	ctx.closePath();
	ctx.strokeStyle = color;
	ctx.stroke();
}

let lastTime = performance.now();
function loop(time) {
	const dt = Math.min((time - lastTime) / 1000, 0.016); // cap at 60 FPS step

	lastTime = time;

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Physics step
	pen1.integrateForces(dt);
	pen2.integrateForces(dt);
	pen1.update(dt);
	pen2.update(dt);

	for (let i = 0; i < 5; i++) {
		// 5 iterations = more stable
		const collision = checkCollision(pen1, pen2);
		if (collision) resolveCollision(pen1, pen2, collision);
	}

	// Collision test
	const hit = resolveCollision(pen1.getVertices(), pen2.getVertices());

	// Draw
	drawBody(pen1, hit ? "red" : "cyan");
	drawBody(pen2, hit ? "red" : "lime");

	requestAnimationFrame(loop);
}

loop(lastTime);
