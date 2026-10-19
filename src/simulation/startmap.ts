import type { Map } from "./starts";
import { SimState } from "../simstate";
//import heightmap from "../assets/heightmap_20261018231006_O0UX.png?raw";
// width of the map in m: ~30 mi across
const WORLD_SIZE = 30 * 1609.344;
const SEA_LEVEL = 1.8 / WORLD_SIZE;

function tsunamiHeight(elapsed: number) {
  const PERIOD = 600;

  if (elapsed < 0) {
    return (Math.sin(elapsed * Math.PI / PERIOD) * 0.2) / WORLD_SIZE + SEA_LEVEL;
  } else return SEA_LEVEL;
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
      let t = Math.pow(d[(x + y * W) * 4], 0.5) / WORLD_SIZE / 2;
      let sea = Math.max(0, SEA_LEVEL - t);
			initState.setTerrain(y, H - 1 - x, t);
			initState.setWater(y, H - 1 - x, sea);
		}
	initState.setBaseTerrain();

	return { initState, worldSize: WORLD_SIZE, speed: 200, dt: 1, sourceHeight: tsunamiHeight, sourceVelocity: (_) => 9 / WORLD_SIZE };
}
