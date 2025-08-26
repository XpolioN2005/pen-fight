class Bot extends RigidBody {
	constructor(x, y, w, h, mass = 1) {
		super(x, y, w, h, mass);
		this.isTurn = false; // bot goes second
	}

	makeMove() {
		if (!this.isTurn) return;

		// Pick random point relative to its body
		const randY = (Math.random() - 0.5) * this.h;

		// Random forward impulse
		const impulseX = -(400 + Math.random() * 200);

		this.applyImpulse(impulseX, randY);
		this.applyTorque(randY * 0.02);

		this.isTurn = false;
	}
}
