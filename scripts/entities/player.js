class Player extends RigidBody {
	constructor(x, y, w, h, mass = 1, name = "Player") {
		super(x, y, w, h, mass);
		this.isTurn = false;
		this.name = name;
		this.hasMoved = false;

		// drag input state
		this.dragging = false;
		this.startX = 0;
		this.startY = 0;
	}

	startDrag(event, canvas) {
		if (!this.isTurn) return;

		const rect = canvas.getBoundingClientRect();
		this.startX = event.clientX - rect.left;
		this.startY = event.clientY - rect.top;
		this.dragging = true;
	}

	endDrag(event, canvas) {
		if (!this.isTurn || !this.dragging) return;

		const rect = canvas.getBoundingClientRect();
		const endX = event.clientX - rect.left;
		const endY = event.clientY - rect.top;

		// drag vector (from end → start) = opposite launch
		const dx = this.startX - endX;
		const dy = this.startY - endY;

		// scale force
		const strength = Math.min(Math.hypot(dx, dy) * 10, 1200); // cap max force

		// normalize
		const len = Math.hypot(dx, dy) || 1;
		const nx = dx / len;
		const ny = dy / len;

		// --- apply impulse at drag release point ---
		this.applyImpulseAtPoint(nx * strength, ny * strength, endX, endY);

		this.dragging = false;
		this.hasMoved = true;
	}
}
