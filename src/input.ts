import type { SimState } from "./simstate";
import { W, H } from "./sim";

var mouseState = {
	size: 0.25, //size used for wave interaction
	clicking: false,
	ignore: false,
	x: 0,
	y: 0,
	pumpStart: null as [number, number] | null,
};

// normalize coordinates to webGL convention
function normalizeCoords(x: number, y: number): [number, number] {
	return [x / window.innerWidth, 1 - y / window.innerHeight];
}

const pileShape: [[number, number], number][] = [];
const pileSize = 4;
for (let x = -pileSize; x < pileSize + 1; x++)
	for (let y = -pileSize; y < pileSize + 1; y++) {
		pileShape.push([
			[x, y],
			Math.exp((-(x * x + y * y) * 9) / (pileSize * pileSize)),
		]);
	}
console.log(pileShape);

export function createHandlers(sim:SimState) {
	//mouse monitoring events
	document.addEventListener("keydown", function (e) {
		console.log(e.key);
		switch (e.key) {
			case " ":
				sim.paused = !sim.paused
		}
	});
	document.addEventListener(
		"mousedown",
		function (e) {
			//console.log(e.button)
			if (e.button == 0) mouseState.clicking = true;
			if (e.button == 2 && !mouseState.ignore)
				mouseState.pumpStart = normalizeCoords(e.pageX, e.pageY);
		},
		false,
	);
	document.addEventListener(
		"mouseup",
		function (e) {
			if (e.button == 0) mouseState.clicking = false;
			if (e.button == 2 && mouseState.pumpStart) {
				/*addPump(mouseState.pumpStart, normalizeCoords(e.pageX, e.pageY))*/;
			}
		},
		false,
	);
	document.addEventListener(
		"mousemove",
		function (event) {
			mouseState.x = event.pageX;
			mouseState.y = event.pageY;
			//console.log(event.buttons)
			if (!(event.buttons && 2)) {
				// in case the button was released while offscreen
				mouseState.pumpStart = null;
			}
		},
		false,
	);
	//don't make waves if mouse is over a form
	var forms = document.getElementsByTagName("form");
	for (var i = 0; i < forms.length; i++) {
		forms[i].onmouseover = function () {
			mouseState.ignore = true;
		};
		forms[i].onmouseout = function () {
			mouseState.ignore = false;
		};
	}
	document
		.getElementById("main_canvas")
		?.addEventListener("contextmenu", (e) => e.preventDefault());
}
let heightLimit = 0.01
export function stepInput(sim: SimState) {
	if (mouseState.clicking && !mouseState.ignore) {
		var [mx, my] = normalizeCoords(mouseState.x, mouseState.y);
		var x = Math.floor(mx * W);
		var y = Math.floor(my * H);
		for (let [[dx, dy], height] of pileShape) {
			if (x + dx > 0 && y + dy > 0 && x + dx < W - 1 && y + dy < H - 1) {
				let prevTerrain = sim.getTerrain(x + dx, y + dy) 
				sim.setTerrain(x + dx, y + dy, Math.max(prevTerrain,height*heightLimit));
			}
		}
	}
}
/*
//map touch events to mouse events for touch compatibility:
function touchHandler(event: TouchEvent)
{
    var touches = event.changedTouches,
	first = touches[0],
	type = "";
	switch(event.type)
	{
	  case "touchstart": type="mousedown"; break;
	  case "touchmove":  type="mousemove"; break;
	  case "touchend":   type="mouseup"; break;
	  default: return;
	}

    //initMouseEvent(type, canBubble, cancelable, view, clickCount,
    //               screenX, screenY, clientX, clientY, ctrlKey,
    //               altKey, shiftKey, metaKey, button, relatedTarget);

    var simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent(type, true, true, window, 1,
                                  first.screenX, first.screenY,
                                  first.clientX, first.clientY, false,
                                  false, false, false, 0, null);

    first.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
}
document.addEventListener("touchstart", touchHandler, true);
document.addEventListener("touchmove", touchHandler, true);
document.addEventListener("touchend", touchHandler, true);
document.addEventListener("touchcancel", touchHandler, true);*/
