const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// === GAME ENTITIES ===
const player = new Player(400, 400, 150, 20, 1, "Player");
const bot = new Bot(400, 200, 150, 20, 1, "Bot");

// Player starts
player.isTurn = true;

// === HELPERS ===
function drawBody(body, color = "cyan") {
	const verts = body.getVertices();
	ctx.beginPath();
	ctx.moveTo(verts[0].x, verts[0].y);
	for (let i = 1; i < verts.length; i++) {
		ctx.lineTo(verts[i].x, verts[i].y);
	}
	ctx.closePath();
	ctx.strokeStyle = color;
	ctx.lineWidth = 2;
	ctx.stroke();
}

function isOutOfBounds(body) {
	const verts = body.getVertices();
	return verts.some(
		(v) => v.x < 0 || v.x > canvas.width || v.y < 0 || v.y > canvas.height
	);
}

function handleOutOfBounds() {
	if (isOutOfBounds(player)) {
		alert("Bot Wins! Player out of bench!");
		return true;
	}
	if (isOutOfBounds(bot)) {
		alert("Player Wins! Bot out of bench!");
		return true;
	}
	return false;
}

// === TURN MANAGEMENT ===
function handleTurnSwitch() {
	// Player finished
	if (player.isTurn && player.hasMoved && player.isResting()) {
		console.log("Player finished turn");
		player.isTurn = false;
		bot.isTurn = true;
		bot.hasMoved = false;
	}

	// Bot turn
	if (bot.isTurn) {
		if (!bot.hasMoved) {
			bot.makeMove(player);
			bot.hasMoved = true;
		} else if (bot.isResting()) {
			console.log("Bot finished turn");
			bot.isTurn = false;
			player.isTurn = true;
			player.hasMoved = false;
		}
	}
	console.log("bot:", bot.isTurn, " player:", player.isTurn);
}

// === PHYSICS & COLLISION ===
function updatePhysics(dt) {
	player.integrateForces(dt);
	bot.integrateForces(dt);

	player.update(dt);
	bot.update(dt);

	for (let i = 0; i < 5; i++) {
		const collision = checkCollision(player, bot);
		if (collision) resolveCollision(player, bot, collision);
	}
}

// === DRAWING ===
function render() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawBody(player, "cyan");
	drawBody(bot, "lime");
}

// === GAME LOOP ===
let lastTime = performance.now();

function gameLoop(time) {
	const dt = Math.min((time - lastTime) / 1000, 0.016);
	lastTime = time;

	updatePhysics(dt);

	if (handleOutOfBounds()) return;

	handleTurnSwitch();

	render();

	requestAnimationFrame(gameLoop);
}

// === INPUT HANDLING ===
function setupInput() {
	canvas.addEventListener("mousedown", (e) => {
		player.startDrag(e, canvas);
	});

	canvas.addEventListener("mouseup", (e) => {
		player.endDrag(e, canvas);
	});
}

// === INIT GAME ===
function init() {
	setupInput();
	gameLoop(lastTime);
}

init();
