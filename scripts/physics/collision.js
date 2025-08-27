import {
	normalize,
	projectPolygon,
	dot,
	cross,
	getSupportPoint,
} from "./helper.js";

// --- SAT collision + response ---
export function checkCollision(bodyA, bodyB) {
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

export function resolveCollision(bodyA, bodyB, collision) {
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
