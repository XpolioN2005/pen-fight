import { RigidBody } from "../physics/rigidBody.js";

export class Bot extends RigidBody {
    constructor(x, y, w, h, mass = 1, targetPlayer) {
        super(x, y, w, h, mass);
        this.targetPlayer = targetPlayer; // reference to player object
        this.speed = 50; // movement speed
        this.attackRange = 40; // distance at which bot "attacks"
        this.lastAttackTime = 0;
        this.attackCooldown = 1.0; // seconds
    }

    updateAI(dt) {
        if (!this.targetPlayer) return;

        // Direction towards player
        const dx = this.targetPlayer.pos_x - this.pos_x;
        const dy = this.targetPlayer.pos_y - this.pos_y;
        const dist = Math.hypot(dx, dy);

        if (dist > this.attackRange) {
            // Move towards player
            const nx = dx / dist;
            const ny = dy / dist;
            this.vx += nx * this.speed * dt;
            this.vy += ny * this.speed * dt;
        } else {
            // Attack if cooldown passed
            const now = performance.now() / 1000;
            if (now - this.lastAttackTime > this.attackCooldown) {
                this.attack();
                this.lastAttackTime = now;
            }
        }
    }

    attack() {
        console.log("Bot attacks the player!");
        
    }
}
