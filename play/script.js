import { startGame } from "../scripts/gameloop/main.js";
import { botScore, youScore } from "../scripts/gameloop/gameover_condition.js";

let level = 1;

const youScoreEl = document.getElementById("youScore");
const botScoreEl = document.getElementById("botScore");
const menuPopup = document.getElementById("menuPopup");
const menuLevelEl = document.getElementById("menuLevel");
const playbench = document.querySelector(".playbench");
const gameOverScreen = document.getElementById("gameOverScreen");

function toggleMenu(state = "toggle", type = "menu") {
	const target = type === "gameover" ? gameOverScreen : menuPopup;

	if (state === "show") {
		target.classList.add("active");
		if (type === "menu") updateMenuStats();
	} else if (state === "hide") {
		target.classList.remove("active");
	} else {
		// toggle
		target.classList.toggle("active");
		if (target.classList.contains("active") && type === "menu") {
			updateMenuStats();
		}
	}
}

function resumeGame() {
	toggleMenu("hide", "menu");
}

function restartGame() {
	menuPopup.classList.remove("active");
	gameOverScreen.style.display = "none";

	level = 1;

	startGame();
	updateDashboard();
	updateMenuStats();

	// hide both menus
	// toggleMenu("hide", "menu");
	// toggleMenu("hide", "gameover");
}

function updateDashboard() {
	youScoreEl.textContent = youScore;
	botScoreEl.textContent = botScore;
}

function updateMenuStats() {
	menuLevelEl.textContent = level;
}

// close menu when clicking outside
playbench.addEventListener("click", function (e) {
	if (
		menuPopup.classList.contains("active") &&
		!menuPopup.contains(e.target) &&
		!e.target.classList.contains("menu-btn")
	) {
		toggleMenu("hide", "menu");
	}
});

// expose functions globally for buttons
window.restartGame = restartGame;
window.resumeGame = resumeGame;
window.toggleMenu = toggleMenu;

// Define global game state
