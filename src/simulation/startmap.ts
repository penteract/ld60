import { SimState } from "../simstate";
//import heightmap from "../assets/heightmap_20261018231006_O0UX.png?raw";
const DAM_Y = 1 / 4; // ratio up the screen the dam is
const DAM_THICKNESS = 4;
const DAM_HEIGHT = 12;
const BREACH_WIDTH = 32;
const RESERVOIR_DEPTH = 10;

export function London(
	dry: number,
	W: number,
	H: number,
	WORLD_SIZE: number,
): SimState {
	const sim = new SimState(W, H);
	//var blob = new Blob([heightmap], { type: "image/png" });
	//var url = URL.createObjectURL("./heightmap_20261018231006_O0UX.png");
	//var img = new Image();
	//img.src = "./heightmap_20261018231006_O0UX.png";
	let img = document.getElementById("heightmap") as HTMLImageElement
	let canvas = document.getElementById("spare_canvas")as HTMLCanvasElement
	canvas.width=W
	canvas.height=H
	let ctx = canvas.getContext("2d");
	if (ctx===null)throw "lol";
	ctx.drawImage(img,0,0,W,H);
	let d = ctx.getImageData(0,0,W,H).data
	console.log(d)
	
	
	//console.log("data length: " + data.length);
	/*console.log("url: " + "");
	console.log(img)
	document.body.appendChild(img);*/

	// a dam with a gap leading to dry ground
	for (let x = 0; x < H; x++)
		for (let y = 0; y < W; y++) {
			let t = Math.pow(d[(x+y*W)*4],0.5)/WORLD_SIZE
			sim.setTerrain(y,H-1-x,t)
			if (H-1-x < H * DAM_Y){
				sim.setWater(y,H-1-x, RESERVOIR_DEPTH/WORLD_SIZE - t)
			}else sim.setWater(y,H-1-x, dry)
			/*const inWall = Math.abs(y + 0.5 - H * DAM_Y) < DAM_THICKNESS / 2;
			const inBreach = Math.abs(x + 0.5 - W / 2) < BREACH_WIDTH / 2;
			if (inWall && !inBreach) {
				sim.setTerrain(x, y, DAM_HEIGHT / WORLD_SIZE);
				sim.setWater(x, y, dry);
			} else if (y < H * DAM_Y)
				sim.setWater(x, y, RESERVOIR_DEPTH / WORLD_SIZE);
			else sim.setWater(x, y, dry);*/
		}
	sim.setBaseTerrain()

	return sim;
}
