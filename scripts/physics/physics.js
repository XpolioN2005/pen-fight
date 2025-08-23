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

// --- SAT collision + response ---
function checkCollision(bodyA, bodyB) {
	const polyA = bodyA.getVertices();
	const polyB = bodyB.getVertices();

	let overlap = Infinity;
	let smallestAxis = null;

	const polys = [polyA, polyB];
	for (let p = 0; p < polys.length; p++) {
		const polygon = polys[p];
		for (let i = 0; i < polygon.length; i++) {
			const j = (i + 1) % polygon.length;
			const edge = {
				x: polygon[j].x - polygon[i].x,
				y: polygon[j].y - polygon[i].y,
			};

			const axis = normalize({ x: -edge.y, y: edge.x });

			let [minA, maxA] = projectPolygon(axis, polyA);
			let [minB, maxB] = projectPolygon(axis, polyB);

			if (maxA < minB || maxB < minA) return null;

			const axisOverlap = Math.min(maxA, maxB) - Math.max(minA, minB);
			if (axisOverlap < overlap) {
				overlap = axisOverlap;
				smallestAxis = axis;
			}
		}
	}

	// ensure axis points from A→B
	const centerDelta = {
		x: bodyB.pos_x - bodyA.pos_x,
		y: bodyB.pos_y - bodyA.pos_y,
	};
	if (dot(centerDelta, smallestAxis) < 0) {
		smallestAxis = { x: -smallestAxis.x, y: -smallestAxis.y };
	}

	return { overlap, axis: smallestAxis };
}

function resolveCollision(bodyA, bodyB, collision) {
	if (!collision) return;

	const { overlap, axis } = collision;

	// separate (position correction)
	const totalInvMass = bodyA.invMass + bodyB.invMass;
	if (totalInvMass === 0) return;

	const correction = {
		x: axis.x * (overlap / totalInvMass),
		y: axis.y * (overlap / totalInvMass),
	};

	bodyA.pos_x -= correction.x * bodyA.invMass;
	bodyA.pos_y -= correction.y * bodyA.invMass;
	bodyB.pos_x += correction.x * bodyB.invMass;
	bodyB.pos_y += correction.y * bodyB.invMass;

	// contact point (midpoint for simplicity)
	const contactPointA = getSupportPoint(bodyA.getVertices(), axis);
	const contactPointB = getSupportPoint(bodyB.getVertices(), {
		x: -axis.x,
		y: -axis.y,
	});
	const contactPoint = {
		x: (contactPointA.x + contactPointB.x) / 2,
		y: (contactPointA.y + contactPointB.y) / 2,
	};

	// from COM to contact
	const ra = {
		x: contactPoint.x - bodyA.pos_x,
		y: contactPoint.y - bodyA.pos_y,
	};
	const rb = {
		x: contactPoint.x - bodyB.pos_x,
		y: contactPoint.y - bodyB.pos_y,
	};

	// relative velocity at contact
	const rvx =
		bodyB.vx -
		bodyA.vx +
		-bodyB.angularVelocity * rb.y -
		-bodyA.angularVelocity * ra.y;
	const rvy =
		bodyB.vy -
		bodyA.vy +
		bodyB.angularVelocity * rb.x -
		bodyA.angularVelocity * ra.x;
	const relVel = { x: rvx, y: rvy };

	const velAlongNormal = dot(relVel, axis);
	if (velAlongNormal > 0) return;

	// bounce factor
	const restitution = 0.4;

	// compute impulse
	const raCrossN = cross(ra, axis);
	const rbCrossN = cross(rb, axis);

	const denom =
		bodyA.invMass +
		bodyB.invMass +
		raCrossN ** 2 * bodyA.invInertia +
		rbCrossN ** 2 * bodyB.invInertia;
	const j = (-(1 + restitution) * velAlongNormal) / denom;

	const impulse = { x: j * axis.x, y: j * axis.y };

	// linear velocity
	bodyA.vx -= impulse.x * bodyA.invMass;
	bodyA.vy -= impulse.y * bodyA.invMass;
	bodyB.vx += impulse.x * bodyB.invMass;
	bodyB.vy += impulse.y * bodyB.invMass;

	// angular velocity
	bodyA.angularVelocity -= raCrossN * j * bodyA.invInertia;
	bodyB.angularVelocity += rbCrossN * j * bodyB.invInertia;
}

// --- helpers ---
function projectPolygon(axis, polygon) {
	const dot = (a, b) => a.x * b.x + a.y * b.y;
	let min = dot(axis, polygon[0]);
	let max = min;
	for (let i = 1; i < polygon.length; i++) {
		const p = dot(axis, polygon[i]);
		if (p < min) min = p;
		if (p > max) max = p;
	}
	return [min, max];
}

function getSupportPoint(polygon, axis) {
	let bestProj = -Infinity;
	let bestVertex = polygon[0];
	for (let v of polygon) {
		const proj = dot(v, axis);
		if (proj > bestProj) {
			bestProj = proj;
			bestVertex = v;
		}
	}
	return bestVertex;
}

function normalize(v) {
	const len = Math.hypot(v.x, v.y);
	return { x: v.x / len, y: v.y / len };
}

function dot(a, b) {
	return a.x * b.x + a.y * b.y;
}

function cross(a, b) {
	return a.x * b.y - a.y * b.x;
}
