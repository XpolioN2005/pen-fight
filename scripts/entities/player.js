import RigidBody from "../physics/rigidBody.js";
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

		this.currentX = this.x;
		this.currentY = this.y;

		this.isGameOver = false;
	}
	getEventPos(event, canvas) {
		const rect = canvas.getBoundingClientRect();
		if (event.touches && event.touches[0]) {
			// touch event
			return {
				x: event.touches[0].clientX - rect.left,
				y: event.touches[0].clientY - rect.top,
			};
		} else {
			// mouse event
			return {
				x: event.clientX - rect.left,
				y: event.clientY - rect.top,
			};
		}
	}

	startDrag(event, canvas) {
		if (!this.isTurn) return;

		const pos = this.getEventPos(event, canvas);
		this.startX = pos.x;
		this.startY = pos.y;
		this.dragging = true;
	}

	updateDrag(event, canvas) {
		if (!this.dragging) return;
		const rect = canvas.getBoundingClientRect();
		this.currentX = (event.clientX || event.touches[0].clientX) - rect.left;
		this.currentY = (event.clientY || event.touches[0].clientY) - rect.top;
	}

	endDrag(event, canvas) {
		if (!this.isTurn || !this.dragging) return;

		const pos = this.getEventPos(event, canvas);
		const endX = pos.x;
		const endY = pos.y;

		// drag vector (from end → start)
		const dx = this.startX - endX;
		const dy = this.startY - endY;

		// ignore tiny drags (deadzone)
		if (Math.hypot(dx, dy) < 5) {
			this.dragging = false;
			return;
		}

		// scale & cap force
		const strength = Math.min(Math.hypot(dx, dy) * 10, 1200);

		// normalize
		const len = Math.hypot(dx, dy) || 1;
		const nx = dx / len;
		const ny = dy / len;

		// apply impulse at release point
		this.applyImpulseAtPoint(nx * strength, ny * strength, endX, endY);

		this.dragging = false;
		this.hasMoved = true;
	}
}

export default Player;
