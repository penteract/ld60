/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*\
|                                                              |
|                         start program                        |
|                                                              |
\*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

import { W, H, step, init, worldSize,engine } from "./simulation/sim";
import { setup } from "./webgl/gl-setup.ts";
import { drawScene } from "./webgl/draw-scene";
import { createHandlers, stepInput, score } from "./input.ts";
import {win,lose} from "./winlose.ts";
import { audio } from "./audio.ts";

declare global {
	interface Window {
		perf: number;
	}
}

const canvas = document.getElementById("main_canvas") as HTMLCanvasElement;

//get canvas and drawing context
//var ctx=canvas.getContext("2d");
/*
//Monitoring event for form submission (to change resolution):
const resolution = document.getElementById("resolution") as HTMLFormElement;
resolution.setAttribute("action", "javascript:newRes();");

//Default resolution:
const NXinput = document.getElementById("nx") as HTMLInputElement;
const NYinput = document.getElementById("ny") as HTMLInputElement;
NXinput.value = "70";
NYinput.value = "70";*/

/*
// Create the simulation
var params = {
	nx: 0,
	ny: 0,
	H: 10, //water depth
	dt: .025 //timestep
};*/

let canvas_state = setup(canvas);

const params = new URLSearchParams(window.location.search);
const mapName = params.get("map");

var sim = init(mapName);
console.log(engine)
let map = engine.map
console.log(engine.map)

if(map.person){
	var target = document.getElementById("Target") as HTMLDivElement
	target.classList.remove("hidden")
	target.style.left=map.person[0]*100+"%"
	target.style.bottom=map.person[1]*100+"%"
}
createHandlers(sim); //(start, end) => sim.pumps.push([start, end]));

let frame = 0;
let time = performance.now()
LoopSim();
function LoopSim() {
	let time2= performance.now()
	//console.log(time2-time )
	if (canvas_state === null) {
		alert("failure to load canvas for game");
		return;
	}
	//This may trigger reflow. Stuff shouldn't be written outside this loop very often
	// But doing it on certain events might be better
	if (
		canvas.width !== window.innerWidth ||
		canvas.height !== window.innerHeight
	) {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		canvas_state.gl.viewport(0, 0, canvas.width, canvas.height);
	}
	//sim.eta.Draw(canvas,ctx,params.eta*1.00,params.eta*1.03);
	//sim.eta.Draw(canvas,ctx,0,0.25);
	//sim.Step(mouseState,canvas);
	if (!sim.paused) {
		let t = performance.now();
		step(sim,time2-time);
		window.perf = performance.now() - t;
		if(map.person && !target.classList.contains("sad")){
			let sz = Math.floor(sim.width/20)
			map.person[0]
			for(let x=-sz;x<sz+1;x++)
				for(let y=-sz;y<sz+1;y++){
					let px = Math.round(map.person[0]*sim.width+x)
					let py = Math.round(map.person[1]*sim.height+y)
					let dx = px-map.person[0]*sim.width
					let dy = py-map.person[1]*sim.height
					if(dx*dx+dy*dy < (sz-2)*(sz-2)){
						//console.log(sim.getWater(x,y)*worldSize())
						if(sim.getWater(px,py)*worldSize()>0.001){
							target.classList.add("sad")
							lose(":(")
						}
						//sim.setWater(px,py,100)
					}
			}
			if(map.timeLimit && map.timeLimit<engine.elapsed && !target.classList.contains("sad")){
					win(score.toPrecision(3));
			}

		} else if(!map.person)
			if (map.timeLimit && map.timeLimit < engine.elapsed) {
				sim.paused = true;
				let metrics = engine.getMetrics();
				let count = 0;
				for (let x = 0; x < W; x++)
					for (let y = 0; y < H; y++) {
						if (metrics[x + y * W] * worldSize() > 0.001) {
							count++;
						}
					}
			win((count-46579)/(1+score).toPrecision());
		}
	}
	//console.log(checkState(sim)+"")
	//console.log(performance.now()-t)
	//console.log(sim.water[3][3])
	stepInput(sim);
	drawScene(canvas_state, sim, worldSize());
	time=time2
	requestAnimationFrame(LoopSim);
	frame++;
	audio.update(sim, frame);
}

function checkState(sim: any) {
	let wrongcount = 0;
	let max_xyht = [0, 0, 0, 0];
	for (let x = 0; x < sim.width; x++)
		for (let y = 0; y < sim.height; y++) {
			if (sim.getWater(x, y) < 0) {
				wrongcount += 1;
				//console.log(x,y)
			}
			for (let i of [0, 1, 2, 3]) {
				max_xyht[i] = Math.max(max_xyht[i], Math.abs(sim.get(x, y, i)));
			}
		}
	return [wrongcount, max_xyht];
}

function addListener(id: string, eventType: string, listener: EventListener) {
	document.getElementById(id).addEventListener(eventType, listener);
}

addListener("menubutton", "click", toggleMenu);
addListener("menuclose", "click", toggleMenu);
addListener("mainmenu", "click", () => {
	window.location.href = "./";
});
addListener("reset", "click", () => {
	window.location.reload();
	// sim = reset(mapName);
	// document.getElementById("menu").hidden = true;
});
addListener("reset1", "click", () => {
	window.location.reload();
	// sim = reset(mapName);
	// document.getElementById("menu").hidden = true;
});


document.addEventListener("keydown", function (e) {
		switch (e.key) {
			case "Escape":
			let el = document.getElementById("menu");
			el.hidden = !el.hidden;
			break;
			case "r":
			// sim = reset(mapName);
			window.location.reload();
			break;
		}
	});

function toggleMenu(event: Event) {
	event.preventDefault();
	let el = document.getElementById("menu");
	el.hidden = !el.hidden;
}

/*
function draw(water,ground){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  let cw = canvas.width/W
  let ch = canvas.height/H
  for(let x=0;x<W;x++)
    for(let y=0;y<H;y++){
      ctx.fillStyle="hsl(240deg,90%,"+0.5*water[x][y]+"%)"
      ctx.fillRect(x*cw,y*ch,cw,ch)
    }
}*/
