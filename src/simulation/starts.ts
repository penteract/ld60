import { SimState } from "../simstate";

export type Map = {
	initState: SimState;
	worldSize: number;
	sourceWater?: (elapsed: number) => { height: number; velocity: number };
	dt?: number;
	speed?: number;
	person?:[number,number];//center of person to keep safe between 0 and 1
	timeLimit?:number
};

export type WaterSource = {
	height: number;
	velocity: number;
};

export function Guy(W: number, H: number): Map {
	const DAM_HEIGHT = 23;
	const BREACH_WIDTH = 10;

	const worldSize = 32; // meters
	const initState = new SimState(W, H);
	const sourceWater = (_: number) => ({
		height: 0.5 / worldSize,
		velocity: 10 / worldSize,
	});

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
		person:[6/7,6/7],
		sourceWater,
		dt: 1/480,
	};
}

export function DamDry(dry: number, W: number, H: number): Map {
	const DAM_Y = 1 / 3; // ratio up the screen the dam is
	const DAM_THICKNESS = 4;
	const DAM_HEIGHT = 20;
	const BREACH_WIDTH = 25;
	const RESERVOIR_DEPTH = 18;

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
			} else if (y < H * DAM_Y) {
				if (x == 0 || x == W - 1)
					initState.setTerrain(x, y, DAM_HEIGHT / worldSize);
				else initState.setWater(x, y, RESERVOIR_DEPTH / worldSize);
			} else initState.setWater(x, y, dry);
		}

	return { initState, worldSize };
}

export function DamWet(dry: number, W: number, H: number): Map {
	const DAM_Y = 1 / 4; // ratio up the screen the dam is
	const DAM_THICKNESS = 4;
	const DAM_HEIGHT = 12;
	const BREACH_WIDTH = 32;
	const RESERVOIR_DEPTH = 10;
	const WATER_HEIGHT = 0.5;

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
			} else if (y < H * DAM_Y) {
				if (x == 0 || x == W - 1)
					initState.setTerrain(x, y, DAM_HEIGHT / worldSize);
				else initState.setWater(x, y, RESERVOIR_DEPTH / worldSize);
			} else initState.setWater(x, y, WATER_HEIGHT / worldSize);
		}

	return { initState, worldSize };
}
