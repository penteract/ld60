/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*\
|                                                              |
|                         start program                        |
|                                                              |
\*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

import { step, init } from "./simulation/sim";
import { setup } from "./webgl/gl-setup.ts";
import { drawScene } from "./webgl/draw-scene";
import { createHandlers, stepInput } from "./input.ts";

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

var sim = init();
createHandlers(sim); //(start, end) => sim.pumps.push([start, end]));

LoopSim();
let frame = 0;
function LoopSim() {
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
		for (let i = 0; i < 1; i++) step(sim);
		window.perf = performance.now() - t;
	}
	//console.log(checkState(sim)+"")
	//console.log(performance.now()-t)
	//console.log(sim.water[3][3])
	stepInput(sim);
	drawScene(canvas_state, sim);
	requestAnimationFrame(LoopSim);
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
