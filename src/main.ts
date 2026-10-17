/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*\
|                                                              |
|                         start program                        |
|                                                              |
\*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

import { SimState, mouseState, canvas } from "./sim";

//get canvas and drawing context
var ctx=canvas.getContext("2d");

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

var sim;

LoopSim();

function LoopSim() {
	if (newResolution)
	{
		var changed=false;

		var tmpNX=NXinput.value;
		if (parseInt(tmpNX)>0 && parseInt(tmpNX)!=params.nx)
		{
			params.nx = parseInt(tmpNX);
			NXinput.value=params.nx;
			changed=true;
		} else {
			NXinput.value=params.nx;
		}
		var tmpNY=NYinput.value;
		if (parseInt(tmpNY)>0 && parseInt(tmpNY)!=params.ny)
		{
			params.ny = parseInt(tmpNY);
			NYinput.value=params.ny;
			changed=true;
		} else {
			NYinput.value=params.ny;
		}

		if (changed) {
			//adjust the mouse interaction size based on resolution
			//mouseState.size = Math.pow(.6-Math.min(params.nx,params.ny)*.001,2);
			mouseState.size = Math.pow(.6-params.nx*params.ny/100000,2);

			//adjust the timestep (to have slower waves at lower resolutions)
			if (params.nx<70 || params.ny<70) {
				params.dt=0.001+0.024*Math.min(params.nx,params.ny)/70;
			} else {
				params.dt=0.025;
			}
			sim = new SimState(params.nx,params.ny,params.H,params.dt,document.getElementById("drop_range").value);

			//Initialize:
			for (var j=0; j<sim.ny; j++)
			{
				for (var i=0; i<sim.nx; i++)
				{
					//sim.eta.val[i+sim.nx*j] = params.eta;
					sim.eta.val[i+sim.nx*j] = 0;
					sim.u.val[i+sim.nx*j] = 0;
					sim.v.val[i+sim.nx*j] = 0;
				}
			}
		}
		newResolution=false;
	}
	//sim.eta.Draw(canvas,ctx,params.eta*1.00,params.eta*1.03);
	sim.eta.Draw(canvas,ctx,0,0.25);
	sim.Step();
	requestAnimationFrame(LoopSim);
}
