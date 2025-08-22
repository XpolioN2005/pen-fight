// // === Renderer Boilerplate ===

// // Load an image helper (promise-based)
// function loadImage(src) {
// 	return new Promise((resolve, reject) => {
// 		const img = new Image();
// 		img.src = src;

// 		img.onload = () => resolve(img);
// 		img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
// 	});
// }

// // Renderer class
// class Renderer {
// 	constructor(canvasId, width, height) {
// 		this.canvas = document.getElementById(canvasId);
// 		this.ctx = this.canvas.getContext("2d");
// 		this.canvas.width = width;
// 		this.canvas.height = height;

// 		this.bg = null; // background image
// 	}

// 	async setBackground(src) {
// 		this.bg = await loadImage(src);
// 	}

// 	clear() {
// 		if (this.bg) {
// 			this.ctx.drawImage(this.bg, 0, 0, this.canvas.width, this.canvas.height);
// 		} else {
// 			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
// 		}
// 	}

// 	// Draw image with position, rotation, and scale
// 	drawImage(img, x, y, angle = 0, scale = 1) {
// 		const ctx = this.ctx;
// 		const w = img.width * scale;
// 		const h = img.height * scale;

// 		ctx.save();
// 		ctx.translate(x, y);
// 		ctx.rotate(angle);
// 		ctx.drawImage(img, -w / 2, -h / 2, w, h);
// 		ctx.restore();
// 	}

// 	// For debugging: draw hitboxes
// 	drawCircle(x, y, radius, color = "red") {
// 		this.ctx.strokeStyle = color;
// 		this.ctx.beginPath();
// 		this.ctx.arc(x, y, radius, 0, Math.PI * 2);
// 		this.ctx.stroke();
// 	}
// }
