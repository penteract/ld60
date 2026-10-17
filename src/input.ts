import type {SimState} from "./simplesim";
import {H,W} from "./simplesim";

var mouseState = {
	size: .25, //size used for wave interaction
	clicking: false,
	ignore: false,
	x: 0,
	y: 0,
	pumpStart:(null as [number,number] | null)
};


const pileShape:[[number,number],number][] = []

for(let x=-3;x<4;x++)for(let y=-3;y<4;y++){
  pileShape.push([[x,y],Math.exp(-(x*x+y*y))])
}


export function createHandlers(addPump: (start: [number, number], end: [number,number]) => void){
  //mouse monitoring events
  document.addEventListener("mousedown", function(e) {
    //console.log(e.button)
    if(e.button==0) mouseState.clicking = true;
    if(e.button==2 && !mouseState.ignore) 
      mouseState.pumpStart = [e.pageX/window.innerWidth, e.pageY/window.innerHeight]
    }, false);
  document.addEventListener("mouseup", function(e) {
    if(e.button==0)mouseState.clicking = false;
    if(e.button==2 && mouseState.pumpStart){
      addPump(mouseState.pumpStart,[e.pageX/window.innerWidth, e.pageY/window.innerHeight])
    }
    }, false);
  document.addEventListener("mousemove", function(event) {
    mouseState.x = event.pageX;
    mouseState.y = event.pageY;
    //console.log(event.buttons)
    if(!(event.buttons && 2)){// in case the button was released while offscreen
      mouseState.pumpStart=null
    }
    }, false);
  //don't make waves if mouse is over a form
  var forms = document.getElementsByTagName("form");
  for (var i=0; i<forms.length; i++) {
    forms[i].onmouseover=function () {mouseState.ignore=true};
    forms[i].onmouseout=function () {mouseState.ignore=false};
  }
  document.getElementById("main_canvas")?.addEventListener("contextmenu",(e)=>e.preventDefault())
}
export function stepInput(sim: SimState){
  if (mouseState.clicking && ! mouseState.ignore){
    //addPile([mouseState.x/window.innerWidth,mouseState.y/window.innerHeight],pileShape)
    var x=Math.floor(mouseState.x/window.innerWidth*W);
    var y=Math.floor(mouseState.y/window.innerHeight*H);
    for(let [[dx,dy],height] of pileShape){
      if (x+dx>0 && y+dy>0 && x+dx<W-1 && y+dy<H-1){
        sim.ground[x+dx][y+dy]+=height
        sim.water[x+dx][y+dy]+=height
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
