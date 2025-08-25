class Player extends RigidBody {
	constructor(x, y, w, h, mass = 1) {
		super(x, y, w, h, mass);
		this.isTurn = true; // start karo
	}

	handleInput(event, canvas) {
		if (!this.isTurn) return;

		const rect = canvas.getBoundingClientRect();
		const mouseY = event.clientY - rect.top;

		// relative to center
		const dy = mouseY - this.pos_y;

		// Apply impulse + torque
		const baseImpulse = 600;
		const impulseY = dy < 0 ? -150 : 150;

		this.applyImpulse(baseImpulse, impulseY);
		this.applyTorque(dy * 0.01); // small spin effect

		this.isTurn = false; 
	}
}
