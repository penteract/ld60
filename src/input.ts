import type { SimState } from "./simstate";
import { W, H, worldSize } from "./simulation/sim";
import { audio } from "./audio";

export let score = 0;

var mouseState = {
	size: 0.25, //size used for wave interaction
	clicking: false,
	ignore: false,
	x: 0,
	y: 0,
	lastClickHeld: null as [number, number] | null,
	pumpStart: null as [number, number] | null,
};

// normalize coordinates to webGL convention
function normalizeCoords(x: number, y: number): [number, number] {
	return [(x * W) / window.innerWidth, H * (1 - y / window.innerHeight)];
}

const pileShape: [[number, number], number][] = [];
const pileSize = 10;
for (let x = -pileSize; x < pileSize + 1; x++)
	for (let y = -pileSize; y < pileSize + 1; y++) {
		pileShape.push([
			[x, y],
			Math.exp((-(x * x + y * y) * 9) / (pileSize * pileSize)),
		]);
	}

type Vec2 = [number, number];

function dot([x, y], [px, py]) {
	return x * px + y * py;
}

function sdist(a, b) {
	return slen(vsub(a, b));
}
function slen([x, y]: Vec2) {
	return x * x + y * y;
}
function vsub([x, y], [x2, y2]): Vec2 {
	return [x - x2, y - y2];
}
function vadd([x, y], [x2, y2]): Vec2 {
	return [x + x2, y + y2];
}
function vmul([x, y], k): Vec2 {
	return [x * k, y * k];
}
function hfunc(squaredist) {
	return (
		(Math.exp((-squaredist * 9) / (pileSize * pileSize)) / worldSize()) *
		heightLimit
	);
}
function drawPath(start: Vec2, end: Vec2, sim: SimState) {
	let xmin = Math.floor(Math.min(start[0], end[0]) - pileSize);
	let xmax = Math.ceil(Math.max(start[0], end[0]) + pileSize);
	let ymin = Math.floor(Math.min(start[1], end[1]) - pileSize);
	let ymax = Math.ceil(Math.max(start[1], end[1]) + pileSize);
	let dir = vsub(end, start);
	let l = Math.sqrt(slen(dir));
	if (l == 0) {
		dir = [1, 0];
	} else {
		dir = vmul(dir, 1 / l);
	}
	let perp = [dir[1], -dir[0]] as Vec2;
	let ds = dot(start, perp);
	let dsd = dot(start, dir);
	let ded = dot(end, dir);
	for (let x = xmin; x < xmax + 1; x++) {
		for (let y = ymin; y < ymax + 1; y++) {
			//TODO make better for diagonal lines
			let intt = [x, y];
			let h;
			let dtd = dot(intt, dir);
			if (dtd < dsd) h = hfunc(sdist(intt, start));
			else if (dtd > ded) h = hfunc(sdist(intt, end));
			else {
				let dst = Math.abs(ds - dot(intt, perp));
				h = hfunc(dst * dst);
			}
			//console.log(x,y,h)
			let prevTerrain = sim.getTerrain(x, y);
			let baseTerrain = sim.getBaseTerrain(x, y);
			let newTerrain = Math.max(prevTerrain, baseTerrain + h)
			score += newTerrain - prevTerrain
			sim.setTerrain(x, y, newTerrain);
		}
	} /*
	//if (Math.random()<0.99)return
	//let [[a,b],[c,d]] = invMat([dir,perp])
	//let [[a,c],[b,d]] = [dir,perp]
	//let det = a*d-b*c;
	let ds = dot(start,perp)
	let de = dot(end,perp)
	console.log(ds,de,dot(dir,perp))
	let p=vadd(vadd(start,vmul(perp,-pileSize)),vmul(dir,-pileSize))
	console.log(start,end,perp,dir)
	for(let i=-pileSize;i<=l+pileSize+1;i++){
		let t=p
		for(let j=-pileSize;j<pileSize+1;j++){
			let h
			let intt = t.map(Math.floor)
			if (i<0) h = hfunc(sdist(intt ,start))
			else if (i>l) h = hfunc(sdist(intt ,end))
			else {
				let dst = Math.abs(ds - dot(intt,perp))
				h = hfunc(dst*dst)
			}
			let [x,y] = intt
			//console.log(x,y,h)
			let prevTerrain = sim.getTerrain(x , y);
			let baseTerrain = sim.getBaseTerrain(x, y);
			sim.setTerrain(x ,y ,
				Math.max(prevTerrain, baseTerrain + h ),
			);
			t=vadd(t,perp)
		}
		p=vadd(p,dir)
	}*/
}
console.log(pileShape);

export function createHandlers(sim: SimState) {
	//mouse monitoring events
	document.addEventListener("keydown", function (e) {
		//console.log(e.key);
		switch (e.key) {
			case " ":
				sim.paused = !sim.paused;
		}
	});
	document.addEventListener(
		"mousedown",
		function (e) {
			//console.log(e.button)
			if (e.button == 0) {
				mouseState.clicking = true;
				if (!mouseState.ignore) {
					mouseState.lastClickHeld = [e.pageX, e.pageY];
					let nc = normalizeCoords(...mouseState.lastClickHeld);
					drawPath(nc, nc, sim);
				}
			}
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
				/*addPump(mouseState.pumpStart, normalizeCoords(e.pageX, e.pageY))*/
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
			if (event.buttons & 1 && !mouseState.ignore) {
				let newPos = [mouseState.x, mouseState.y];
				if (mouseState.lastClickHeld) {
					drawPath(
						normalizeCoords(...mouseState.lastClickHeld),
						normalizeCoords(...newPos),
						sim,
					);
				}
				mouseState.lastClickHeld = newPos;
			}
		},
		false,
	);
	//don't make waves if mouse is over a form
	var forms = document.getElementsByTagName("form");
	for (var i = 0; i < forms.length; i++) {
		forms[i].onmouseover = function () {
			mouseState.ignore = true;
			mouseState.lastClickHeld = null;
		};
		forms[i].onmouseout = function () {
			mouseState.ignore = false;
		};
	}
	document
		.getElementById("main_canvas")
		?.addEventListener("contextmenu", (e) => e.preventDefault());
}
let heightLimit = 3;
export function stepInput(sim: SimState) {
	if (mouseState.clicking && !mouseState.ignore) {
		var [mx, my] = normalizeCoords(mouseState.x, mouseState.y);
		var x = Math.floor(mx);
		var y = Math.floor(my);
		audio.playNote(sim.getWater(x, y));
	} else {
		audio.stop();
	}
}

//map touch events to mouse events for touch compatibility:
function touchHandler(event: TouchEvent) {
	var touches = event.changedTouches,
		first = touches[0],
		type = "";
	switch (event.type) {
		case "touchstart":
			type = "mousedown";
			break;
		case "touchmove":
			type = "mousemove";
			break;
		case "touchend":
			type = "mouseup";
			break;
		default:
			return;
	}

	//initMouseEvent(type, canBubble, cancelable, view, clickCount,
	//               screenX, screenY, clientX, clientY, ctrlKey,
	//               altKey, shiftKey, metaKey, button, relatedTarget);

	var simulatedEvent = document.createEvent("MouseEvent");
	simulatedEvent.initMouseEvent(
		type,
		true,
		true,
		window,
		1,
		first.screenX,
		first.screenY,
		first.clientX,
		first.clientY,
		false,
		false,
		false,
		false,
		0,
		null,
	);

	first.target.dispatchEvent(simulatedEvent);
	event.preventDefault();
}
document.addEventListener("touchstart", touchHandler, true);
document.addEventListener("touchmove", touchHandler, true);
document.addEventListener("touchend", touchHandler, true);
document.addEventListener("touchcancel", touchHandler, true);
