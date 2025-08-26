class Bot extends RigidBody {
	constructor(x, y, w, h, mass = 1, name = "Bot") {
		super(x, y, w, h, mass);
		this.isTurn = false;
		this.name = name;
		this.hasMove = true;
	}

	makeMove(player) {
		if (!this.isTurn) return;

		const baseStrength = 1000;

		// --- Direction from bot to player ---
		let dx = player.pos_x - this.pos_x;
		let dy = player.pos_y - this.pos_y;

		// Normalize
		const len = Math.sqrt(dx * dx + dy * dy);
		if (len > 0) {
			dx /= len;
			dy /= len;
		}

		// Add some randomness so it's not perfect aim
		const spread = 0.2; // radians
		const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * spread;
		const nx = Math.cos(angle);
		const ny = Math.sin(angle);

		// Apply impulse toward player
		this.applyImpulse(nx * baseStrength, ny * baseStrength);

		// Add some torque for spin
		const torque = (Math.random() - 0.5) * 30;
		this.applyTorque(torque);

		// End turn
		// this.isTurn = false;
	}
}
