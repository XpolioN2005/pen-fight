class Renderer {
	constructor(canvas) {
		this.ctx = canvas.getContext("2d");
		this.canvas = canvas;
	}

	clear() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	drawShape(x, y, w, h, rotation = 0, color = "white") {
		this.ctx.save();
		this.ctx.translate(x, y);
		this.ctx.rotate(rotation);
		this.ctx.fillStyle = color;
		this.ctx.fillRect(-w / 2, -h / 2, w, h);
		this.ctx.restore();
	}

	drawText(text, x, y, color = "white", size = "16px") {
		this.ctx.fillStyle = color;
		this.ctx.font = `${size} Arial`;
		this.ctx.fillText(text, x, y);
	}

	DEBUG_drawBody(body, color = "cyan") {
		const verts = body.getVertices();
		this.ctx.beginPath();
		this.ctx.moveTo(verts[0].x, verts[0].y);
		for (let i = 1; i < verts.length; i++) {
			this.ctx.lineTo(verts[i].x, verts[i].y);
		}
		this.ctx.closePath();
		this.ctx.strokeStyle = color;
		this.ctx.lineWidth = 2;
		this.ctx.stroke();
	}

	drawBodyImage(body, image) {
		const { pos_x, pos_y, angle, w, h } = body;

		this.ctx.save();
		this.ctx.translate(pos_x, pos_y);
		this.ctx.rotate(angle);
		this.ctx.drawImage(image, -w / 2, -h / 2, w, h);
		this.ctx.restore();
	}
}
