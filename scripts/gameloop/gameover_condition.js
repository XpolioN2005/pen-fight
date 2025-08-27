// === Polygon Area (Shoelace formula) ===
function polygonArea(verts) {
	let area = 0;
	for (let i = 0; i < verts.length; i++) {
		const j = (i + 1) % verts.length;
		area += verts[i].x * verts[j].y - verts[j].x * verts[i].y;
	}
	return Math.abs(area) / 2;
}

// === Polygon Clipping (Sutherland–Hodgman) ===
function clipPolygon(polygon, edgeFn) {
	const output = [];
	for (let i = 0; i < polygon.length; i++) {
		const curr = polygon[i];
		const prev = polygon[(i - 1 + polygon.length) % polygon.length];

		const currInside = edgeFn(curr);
		const prevInside = edgeFn(prev);

		if (currInside) {
			if (!prevInside) {
				output.push(edgeFn.intersection(prev, curr));
			}
			output.push(curr);
		} else if (prevInside) {
			output.push(edgeFn.intersection(prev, curr));
		}
	}
	return output;
}

// === Clip polygon against canvas rectangle ===
function clipToCanvas(polygon, canvas) {
	let clipped = polygon;

	const left = {
		inside: (p) => p.x >= 0,
		intersection: (a, b) => ({
			x: 0,
			y: a.y + ((b.y - a.y) * (0 - a.x)) / (b.x - a.x),
		}),
	};

	const right = {
		inside: (p) => p.x <= canvas.width,
		intersection: (a, b) => ({
			x: canvas.width,
			y: a.y + ((b.y - a.y) * (canvas.width - a.x)) / (b.x - a.x),
		}),
	};

	const top = {
		inside: (p) => p.y >= 0,
		intersection: (a, b) => ({
			y: 0,
			x: a.x + ((b.x - a.x) * (0 - a.y)) / (b.y - a.y),
		}),
	};

	const bottom = {
		inside: (p) => p.y <= canvas.height,
		intersection: (a, b) => ({
			y: canvas.height,
			x: a.x + ((b.x - a.x) * (canvas.height - a.y)) / (b.y - a.y),
		}),
	};

	clipped = clipPolygon(
		clipped,
		Object.assign((p) => left.inside(p), left)
	);
	clipped = clipPolygon(
		clipped,
		Object.assign((p) => right.inside(p), right)
	);
	clipped = clipPolygon(
		clipped,
		Object.assign((p) => top.inside(p), top)
	);
	clipped = clipPolygon(
		clipped,
		Object.assign((p) => bottom.inside(p), bottom)
	);

	return clipped;
}

// === Public API ===
export function isOutOfBounds(player, body, canvas, threshold = 0.4) {
	const verts = body.getVertices();
	const bodyArea = polygonArea(verts);

	const clipped = clipToCanvas(verts, canvas);
	if (clipped.length < 3) return true; // fully outside

	const insideArea = polygonArea(clipped);
	const insideFraction = insideArea / bodyArea;

	if (insideFraction < 1 - threshold) {
		player.isGameOver = true;
	}
	return insideFraction < 1 - threshold;
	// threshold=0.4 → if 40%+ area outside → true
}

export let youScore = 0;
export let botScore = 0;
export function handleOutOfBounds(player, bot, canvas) {
	const gameOverScreen = document.getElementById("gameOverScreen");
	const gameOverText = document.getElementById("gameOverText");
	if (!player.isGameOver) {
		if (isOutOfBounds(player, player, canvas)) {
			gameOverText.textContent = "Bot Wins! You Lose!";
			gameOverScreen.style.display = "flex";
			botScore += 1;
			return true;
		}

		if (isOutOfBounds(player, bot, canvas)) {
			gameOverText.textContent = "You Win!";
			gameOverScreen.style.display = "flex";
			youScore += 1;
			return true;
		}
	}

	return false;
}
