import { SimState } from "../simstate";

export type Map = {
	initState: SimState;
	worldSize: number;
	sourceVelocity?: (time: number) => number;
	sourceHeight?: (time: number) => number;
};

export function Guy(W: number, H: number): Map {
	const DAM_HEIGHT = 23;
	const BREACH_WIDTH = 10;

	const worldSize = 32; // meters
	const initState = new SimState(W, H);
	const sourceVelocity = 1000 / worldSize;
	const sourceHeight = 0.5 / worldSize;

	// a fairly straightforward map where there is a small flow from the
	// south and a guy that needs protecting
	for (let x = 0; x < W; x++)
		for (let y = 0; y < H; y++) {
			const inWall = y <= DAM_HEIGHT;
			const inBreach = Math.abs(x + 0.5 - W / 2) < BREACH_WIDTH / 2;
			if (inWall && !inBreach) {
				initState.setTerrain(x, y, DAM_HEIGHT / worldSize);
			}
		}

	return {
		initState,
		worldSize,
		sourceVelocity: (_) => sourceVelocity,
		sourceHeight: (_) => sourceHeight,
	};
}

export function DamDry(dry: number, W: number, H: number): Map {
	const DAM_Y = 1 / 4; // ratio up the screen the dam is
	const DAM_THICKNESS = 4;
	const DAM_HEIGHT = 12;
	const BREACH_WIDTH = 32;
	const RESERVOIR_DEPTH = 10;

	const worldSize = 128; // meters
	const initState = new SimState(W, H);

	// a dam with a gap leading to dry ground
	for (let x = 0; x < W; x++)
		for (let y = 0; y < H; y++) {
			const inWall = Math.abs(y + 0.5 - H * DAM_Y) < DAM_THICKNESS / 2;
			const inBreach = Math.abs(x + 0.5 - W / 2) < BREACH_WIDTH / 2;
			if (inWall && !inBreach) {
				initState.setTerrain(x, y, DAM_HEIGHT / worldSize);
				initState.setWater(x, y, dry);
			} else if (y < H * DAM_Y)
				initState.setWater(x, y, RESERVOIR_DEPTH / worldSize);
			else initState.setWater(x, y, dry);
		}

	return { initState, worldSize };
}
