import { SimState } from "./simstate";

const DAM_Y = 1 / 4; // ratio up the screen the dam is
const DAM_THICKNESS = 4;
const DAM_HEIGHT = 12;
const BREACH_WIDTH = 32;
const RESERVOIR_DEPTH = 10;

export function DamDry(
	dry: number,
	W: number,
	H: number,
	WORLD_SIZE: number,
): SimState {
	const sim = new SimState(W, H);

	// a dam with a gap leading to dry ground
	for (let x = 0; x < W; x++)
		for (let y = 0; y < H; y++) {
			const inWall = Math.abs(y + 0.5 - H * DAM_Y) < DAM_THICKNESS / 2;
			const inBreach = Math.abs(x + 0.5 - W / 2) < BREACH_WIDTH / 2;
			if (inWall && !inBreach) {
				sim.setTerrain(x, y, DAM_HEIGHT / WORLD_SIZE);
				sim.setWater(x, y, dry);
			} else if (y < H * DAM_Y)
				sim.setWater(x, y, RESERVOIR_DEPTH / WORLD_SIZE);
			else sim.setWater(x, y, dry);
		}

	return sim;
}
