class Bot extends RigidBody {
	constructor(x, y, w, h, mass = 1, name = "Bot") {
		super(x, y, w, h, mass);
		this.isTurn = false;
		this.name = name;
		this.hasMove = true;
	}

	makeMove() {
		if (!this.isTurn) return;

		// Bot aims roughly "forward-left" with some randomness
		const baseStrength = 500;
		const randomAngle = (Math.random() - 0.5) * 0.5; // -0.25rad to +0.25rad
		const nx = Math.cos(Math.PI + randomAngle); // facing left
		const ny = Math.sin(Math.PI + randomAngle);

		// Apply impulse in that direction
		this.applyImpulse(nx * baseStrength, ny * baseStrength);

		// Add some torque bias (random spin)
		const torque = (Math.random() - 0.5) * 30;
		this.applyTorque(torque);

		// this.isTurn = false;
	}
}
