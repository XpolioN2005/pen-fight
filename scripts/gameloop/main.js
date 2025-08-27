// === IMPORTS ===
import Player from "../entities/player.js";
import Bot from "../entities/bot.js";

import { handleOutOfBounds } from "../gameloop/gameover_condition.js";
import { checkCollision, resolveCollision } from "../physics/collision.js";
import Renderer from "../render/render.js";

// === DEFINE ===
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// === GAME ENTITIES ===
export let player;
export let bot;

function createEntities() {
	player = new Player(400, 400, 150, 20, 1, "Player");
	bot = new Bot(400, 200, 150, 20, 0.7, "Bot");

	// Player starts
	player.isTurn = true;
	bot.isTurn = false;
}

// === TURN MANAGEMENT ===
function handleTurnSwitch() {
	if (player.isTurn && player.hasMoved && player.isResting()) {
		console.log("Player finished turn");
		player.isTurn = false;
		bot.isTurn = true;
		bot.hasMoved = false;
	}

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
const renderer = new Renderer(canvas);
const playerImage = new Image();
playerImage.src = "../assets/sprite/blue.png";
const botImage = new Image();
botImage.src = "../assets/sprite/red.png";

function render() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	renderer.drawBodyImage(player, playerImage);
	renderer.drawBodyImage(bot, botImage);

	if (player.dragging && !player.hasMoved && player.isTurn) {
		ctx.beginPath();
		ctx.moveTo(player.startX, player.startY);
		ctx.lineTo(player.currentX, player.currentY);
		ctx.strokeStyle = "red";
		ctx.lineWidth = 3;
		ctx.setLineDash([5, 5]);
		ctx.stroke();
		ctx.setLineDash([]);
	}
}

// === GAME LOOP ===
let lastTime;
const trunText = document.getElementById("turn");

function gameLoop(time) {
	const dt = Math.min((time - lastTime) / 1000, 0.016);
	lastTime = time;

	updatePhysics(dt);

	if (handleOutOfBounds(player, bot, canvas)) return;

	handleTurnSwitch();

	if (player.isTurn) {
		trunText.textContent = "YOUR TURN";
	}

	if (bot.isTurn) {
		trunText.textContent = "BOT TURN";
	}

	render();

	requestAnimationFrame(gameLoop);
}

// === INPUT HANDLING ===
function setupInput() {
	canvas.addEventListener("mousedown", (e) => player.startDrag(e, canvas));
	canvas.addEventListener("mousemove", (e) => player.updateDrag(e, canvas));
	canvas.addEventListener("mouseup", (e) => player.endDrag(e, canvas));

	canvas.addEventListener("touchstart", (e) => player.startDrag(e, canvas));
	canvas.addEventListener("touchmove", (e) => player.updateDrag(e, canvas));
	canvas.addEventListener("touchend", (e) => player.endDrag(e, canvas));
}

// === START/RESTART GAME ===
export function startGame() {
	createEntities();
	player.isGameover = false;
	setupInput();
	lastTime = performance.now();
	requestAnimationFrame(gameLoop);
}

// === INIT GAME ===
function init() {
	startGame();
}

init();
