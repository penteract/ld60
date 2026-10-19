import type { Map, WaterSource } from "./starts";
import { SimState } from "../simstate";
//import heightmap from "../assets/heightmap_20261018231006_O0UX.png?raw";
// width of the map in m: ~30 mi across
const WORLD_SIZE = 30 * 6400;
const SEA_LEVEL = 10 / WORLD_SIZE;

function tsunamiSource(elapsed: number): WaterSource {
	const PERIOD = 1200;
	const TSUNAMI_DEPTH = 2.5;

	let height = SEA_LEVEL,
		velocity = -1;

	if (elapsed < PERIOD) {
		let anomaly =
			(Math.sin((elapsed * Math.PI) / PERIOD) * TSUNAMI_DEPTH) / WORLD_SIZE;
		height = anomaly + SEA_LEVEL;
		velocity = anomaly * Math.sqrt(9.81 / height * WORLD_SIZE);
	}

	return { height, velocity };
}

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

	for (let x = 0; x < H; x++)
		for (let y = 0; y < W; y++) {
			let t = d[(x + y * W) * 4] / WORLD_SIZE / 8;
			let sea = Math.max(0, SEA_LEVEL - t);
			initState.setTerrain(y, H - 1 - x, t);
			initState.setWater(y, H - 1 - x, sea);
		}
	initState.setBaseTerrain();

	return {
		initState,
		worldSize: WORLD_SIZE,
		speed: 400,
		dt: 5,
		sourceWater: tsunamiSource,
	};
}
