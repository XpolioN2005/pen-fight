class RigidBody {
	constructor(x, y, w, h, mass = 1) {
		// Core properties
		this.pos_x = x;
		this.pos_y = y;
		this.w = w;
		this.h = h;
		this.angle = 0;

		// Physics
		this.mass = mass;
		this.invMass = mass === 0 ? 0 : 1 / mass;
		this.vx = 0;
		this.vy = 0;
		this.angularVelocity = 0;

		this.forces = { x: 0, y: 0 };
		this.torque = 0;

		// inertia (rectangle formula)
		this.inertia = (mass * (w ** 2 + h ** 2)) / 12;
		this.invInertia = mass === 0 ? 0 : 1 / this.inertia;
	}

	// --- Forces & impulses ---
	applyForce(fx, fy) {
		this.forces.x += fx;
		this.forces.y += fy;
	}

	applyImpulse(ix, iy) {
		this.vx += ix * this.invMass;
		this.vy += iy * this.invMass;
	}

	applyTorque(t) {
		this.torque += t;
	}

	// --- Physics step ---
	integrateForces(dt) {
		if (this.mass === 0) return;
		this.vx += this.forces.x * this.invMass * dt;
		this.vy += this.forces.y * this.invMass * dt;
		this.angularVelocity += this.torque * this.invInertia * dt;

		// clear forces
		this.forces.x = 0;
		this.forces.y = 0;
		this.torque = 0;
	}

	update(dt) {
		this.pos_x += this.vx * dt;
		this.pos_y += this.vy * dt;
		this.angle += this.angularVelocity * dt;

		// simple damping so pens don't spin/slide forever
		this.vx *= 0.99;
		this.vy *= 0.99;
		this.angularVelocity *= 0.98;
	}

	// --- Collision geometry ---
	getVertices() {
		const cos = Math.cos(this.angle);
		const sin = Math.sin(this.angle);
		const hw = this.w / 2;
		const hh = this.h / 2;

		return [
			{
				x: this.pos_x + cos * hw - sin * hh,
				y: this.pos_y + sin * hw + cos * hh,
			},
			{
				x: this.pos_x - cos * hw - sin * hh,
				y: this.pos_y - sin * hw + cos * hh,
			},
			{
				x: this.pos_x - cos * hw + sin * hh,
				y: this.pos_y - sin * hw - cos * hh,
			},
			{
				x: this.pos_x + cos * hw + sin * hh,
				y: this.pos_y + sin * hw - cos * hh,
			},
		];
	}
}
