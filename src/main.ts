/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*\
|                                                              |
|                         start program                        |
|                                                              |
\*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

import {H,W,step,init} from "./simplesim";
import {setup} from "./webgl/main";
import {drawScene} from "./webgl/draw-scene";
import type { SimState } from "./sim";

var mouseState = {
	size: .25, //size used for wave interaction
	clicking: false,
	ignore: false,
	x: 0,
	y: 0
};

const canvas = document.getElementById("main_canvas") as HTMLCanvasElement


//get canvas and drawing context
//var ctx=canvas.getContext("2d");

//mouse monitoring events
document.addEventListener("mousedown", function(event) {
	mouseState.clicking = true;
	}, false);
document.addEventListener("mouseup", function(event) {
	mouseState.clicking = false;
	}, false);
document.addEventListener("mousemove", function(event) {
	mouseState.x = event.pageX;
	mouseState.y = event.pageY;
	}, false);

//don't make waves if mouse is over a form
var forms = document.getElementsByTagName("form");
for (var i=0; i<forms.length; i++) {
	forms[i].onmouseover=function () {mouseState.ignore=true};
	forms[i].onmouseout=function () {mouseState.ignore=false};
}

//map touch events to mouse events for touch compatibility:
function touchHandler(event)
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
                                  false, false, false, 0/*left*/, null);

    first.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
}
document.addEventListener("touchstart", touchHandler, true);
document.addEventListener("touchmove", touchHandler, true);
document.addEventListener("touchend", touchHandler, true);
document.addEventListener("touchcancel", touchHandler, true);

//Monitoring event for form submission (to change resolution):
var resolution=document.getElementById("resolution");
var newResolution=true;
resolution.setAttribute('action','javascript:newRes();');
resolution.addEventListener("submit", function(event){
	newResolution=true;
	}, false);
function newRes() {
	newResolution=true;
}

//Default resolution:
var NXinput=document.getElementById("nx");
var NYinput=document.getElementById("ny");
NXinput.value="70";
NYinput.value="70";




// Create the simulation
var params = {
	nx: 0,
	ny: 0,
	H: 10, //water depth
	dt: .025 //timestep
};


const pileshape:[[number,number],number][] = []
for(let x=-3;x<4;x++)for(let y=-3;y<4;y++){
  pileshape.push([[x,y],Math.exp(-(x*x+y*y))])
}


let canvas_state = setup(canvas)

var sim = init();

LoopSim();

function LoopSim() {
	//This may trigger reflow. Stuff shouldn't be written outside this loop very often
	// But doing it on certain events might be better
	if(canvas.width!==window.innerWidth||canvas.height!==window.innerHeight){
		canvas.width = window.innerWidth
		canvas.height = window.innerHeight
		canvas_state.gl.viewport(0,0,canvas.width,canvas.height)
	}
	//sim.eta.Draw(canvas,ctx,params.eta*1.00,params.eta*1.03);
	//sim.eta.Draw(canvas,ctx,0,0.25);
	//sim.Step(mouseState,canvas);
	let t = performance.now()
	for(let i=0;i<1;i++)step(sim)
  //console.log(performance.now()-t)
	window.perf = performance.now()-t
  //console.log(sim.water[3][3])
  if (mouseState.clicking && ! mouseState.ignore){
    var x=Math.floor(mouseState.x/canvas.width*W);
    var y=Math.floor(mouseState.y/canvas.height*H);
    for(let [[dx,dy],height] of pileshape){
      if (x+dx>0 && y+dy>0 && x+dx<W-1 && y+dy<H-1){
        sim.ground[x+dx][y+dy]+=height
        sim.water[x+dx][y+dy]+=height
      }
    }
  }
  drawScene(canvas_state,sim.water,sim.ground)
	requestAnimationFrame(LoopSim);
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
