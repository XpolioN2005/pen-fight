// --- helpers ---

function dot(a, b) {
	return a.x * b.x + a.y * b.y;
}

function cross(a, b) {
	// 2D scalar cross product
	return a.x * b.y - a.y * b.x;
}

function normalize(v) {
	const len = Math.hypot(v.x, v.y);
	if (len === 0) return { x: 0, y: 0 };
	return { x: v.x / len, y: v.y / len };
}

function projectPolygon(axis, polygon) {
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
