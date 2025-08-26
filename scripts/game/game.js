// ==========================
// Renderer
// ==========================
class Renderer {
  constructor(canvas) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawShape(x, y, w, h, rotation = 0, color = "white") {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(rotation);
    this.ctx.fillStyle = color;
    this.ctx.fillRect(-w / 2, -h / 2, w, h);
    this.ctx.restore();
  }

  drawText(text, x, y, color = "white", size = "16px") {
    this.ctx.fillStyle = color;
    this.ctx.font = `${size} Arial`;
    this.ctx.fillText(text, x, y);
  }
}

// ==========================
// Entity
// ==========================
class Entity {
  constructor(x, y, w, h, color = "cyan") {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color;
    this.rotation = 0;
    this.speed = 2;
  }

  update(input) {
    if (input["ArrowUp"]) this.y -= this.speed;
    if (input["ArrowDown"]) this.y += this.speed;
    if (input["ArrowLeft"]) this.x -= this.speed;
    if (input["ArrowRight"]) this.x += this.speed;

    if (input["a"]) this.rotation -= 0.05;
    if (input["d"]) this.rotation += 0.05;
  }

  draw(renderer) {
    renderer.drawShape(this.x, this.y, this.w, this.h, this.rotation, this.color);
  }
}

// ==========================
// Scene Manager
// ==========================
class Scene {
  constructor() {
    this.entities = [];
  }

  add(entity) {
    this.entities.push(entity);
  }

  update(input) {
    for (let e of this.entities) e.update(input);
  }

  draw(renderer) {
    for (let e of this.entities) e.draw(renderer);
  }
}

// ==========================
// Input Handler
// ==========================
class InputHandler {
  constructor() {
    this.keys = {};
    window.addEventListener("keydown", e => this.keys[e.key] = true);
    window.addEventListener("keyup", e => this.keys[e.key] = false);
  }
}

// ==========================
// Game Setup
// ==========================
const canvas = document.getElementById("gameCanvas");
canvas.width = 800;
canvas.height = 600;

const renderer = new Renderer(canvas);
const scene = new Scene();
const input = new InputHandler();

// Player pen
const player = new Entity(200, 300, 60, 10, "cyan");
scene.add(player);

// Enemy pen (static for now)
const enemy = new Entity(600, 300, 60, 10, "red");
scene.add(enemy);

// ==========================
// Game Loop
// ==========================
function gameLoop() {
  renderer.clear();

  // Update entities
  scene.update(input.keys);

  // Draw arena border
  renderer.drawShape(canvas.width / 2, canvas.height / 2, canvas.width, canvas.height, 0, "#333");

  // Draw entities
  scene.draw(renderer);

  // Debug info
  renderer.drawText("Use Arrow Keys + A/D to move/rotate", 20, 20);

  requestAnimationFrame(gameLoop);
}

gameLoop();
