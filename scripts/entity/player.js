// temporary, until we have a proper entity system
import { RigidBody } from "../physics/rigidBody.js";


// OR export class RigidBody { ... } ...?

export class Player extends RigidBody {
  /**
   * keys: { up, down, left, right, attack } e.g. { up:"KeyW", left:"KeyA", ... }
   */
  constructor(x, y, w, h, mass = 1, keys = null) {
    super(x, y, w, h, mass);

    // Tuning
    this.moveAccel = 900;      // px/s^2 forward/back
    this.strafeAccel = 700;    // px/s^2 side movement (optional) can be removed @xpo
    this.maxSpeed = 260;       // speed clamp
    this.turnSpeed = 4.5;      // rad/s
    this.dashImpulse = 320;    // impulse applied on attack
    this.attackCooldown = 0.35;
    this.lastAttackTime = -999;

    // Input
    this.keys = keys || { up: "KeyW", down: "KeyS", left: "KeyA", right: "KeyD", attack: "Space" };
    this._key = new Set();

    // input systems are not build .... jaldi karo
    window.addEventListener("keydown", (e) => this._key.add(e.code));
    window.addEventListener("keyup",   (e) => this._key.delete(e.code));
  }

  // Helper to clamp speed
  _limitSpeed() {
    const s = Math.hypot(this.vx, this.vy);
    if (s > this.maxSpeed) {
      const k = this.maxSpeed / s;
      this.vx *= k; this.vy *= k;
    }
  }

  // Call each frame from your game loop BEFORE physics update()
  updateControl(dt) {
    // Facing direction unit vector from angle
    const fx = Math.cos(this.angle);
    const fy = Math.sin(this.angle);

    // Strafe direction (perpendicular)
    const sx = -fy;
    const sy =  fx;

    // Rotation
    if (this._key.has(this.keys.left))  this.angle -= this.turnSpeed * dt;
    if (this._key.has(this.keys.right)) this.angle += this.turnSpeed * dt;

    // Thrust forward/back
    if (this._key.has(this.keys.up)) {
      this.vx += fx * this.moveAccel * dt;
      this.vy += fy * this.moveAccel * dt;
    }
    if (this._key.has(this.keys.down)) {
      this.vx -= fx * this.moveAccel * dt * 0.6; // weaker reverse
      this.vy -= fy * this.moveAccel * dt * 0.6;
    }

    // (Optional) strafe with A/D if you map arrows to rotation; here we keep rotation on left/right.
    // Uncomment if you want QE for strafing, for example.

    this._limitSpeed();

    // Attack = quick dash impulse along facing dir
    if (this._key.has(this.keys.attack)) {
      const now = performance.now() / 1000;
      if (now - this.lastAttackTime > this.attackCooldown) {
        this.applyImpulse(fx * this.dashImpulse, fy * this.dashImpulse);
        this.lastAttackTime = now;
      }
    }
  }
}
