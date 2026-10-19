import type { Map } from "./starts";
import { SimState } from "../simstate";
//import heightmap from "../assets/heightmap_20261018231006_O0UX.png?raw";
// width of the map in m: ~30 mi across
const WORLD_SIZE = 30 * 1609.344;
const DAM_Y = 1 / 4; // ratio up the screen the dam is
const RESERVOIR_DEPTH = 10;

export function London(dry: number, W: number, H: number): Map {
	const initState = new SimState(W, H);
	//var blob = new Blob([heightmap], { type: "image/png" });
	//var url = URL.createObjectURL("./heightmap_20261018231006_O0UX.png");
	//var img = new Image();
	//img.src = "./heightmap_20261018231006_O0UX.png";
	let img = document.getElementById("heightmap") as HTMLImageElement;
	let canvas = document.getElementById("spare_canvas") as HTMLCanvasElement;
	canvas.width = W;
	canvas.height = H;
	let ctx = canvas.getContext("2d");
	if (ctx === null) throw "lol"; // lol
	ctx.drawImage(img, 0, 0, W, H);
	let d = ctx.getImageData(0, 0, W, H).data;
	console.log(d);

	//console.log("data length: " + data.length);
	/*console.log("url: " + "");
	console.log(img)
	document.body.appendChild(img);*/

	// a dam with a gap leading to dry ground
	for (let x = 0; x < H; x++)
		for (let y = 0; y < W; y++) {
			let t = Math.pow(d[(x + y * W) * 4], 0.5) / WORLD_SIZE / 2;
			initState.setTerrain(y, H - 1 - x, t);
			if (H - 1 - x < H * DAM_Y) {
				initState.setWater(y, H - 1 - x, RESERVOIR_DEPTH / WORLD_SIZE - t);
			} else initState.setWater(y, H - 1 - x, dry);
			/*const inWall = Math.abs(y + 0.5 - H * DAM_Y) < DAM_THICKNESS / 2;
			const inBreach = Math.abs(x + 0.5 - W / 2) < BREACH_WIDTH / 2;
			if (inWall && !inBreach) {
				initState.setTerrain(x, y, DAM_HEIGHT / WORLD_SIZE);
				initState.setWater(x, y, dry);
			} else if (y < H * DAM_Y)
				initState.setWater(x, y, RESERVOIR_DEPTH / WORLD_SIZE);
			else initState.setWater(x, y, dry);*/
		}
	initState.setBaseTerrain();

	return { initState, worldSize: WORLD_SIZE, speed: 100, dt: 1 };
}
