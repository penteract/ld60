// SimState is the interface between the sim and js.
// It is modeled on the shape of the state texture in WebFlood.

// the number of elements per loc'n
const NUM_CHANNELS = 4;

const VX = 0;
const VY = 1;
const WATER = 2;
const TERRAIN = 3;

export class SimState extends Float32Array {
	baseTerrain: Float32Array;
	width: number;
	height: number;
	pumps: [[number, number], [number, number]][];
	paused: boolean;

	constructor(width: number, height: number) {
		super(width * height * NUM_CHANNELS);
		this.width = width;
		this.height = height;
		this.pumps = [];
		this.paused = true;
		this.baseTerrain = new Float32Array(width * height * NUM_CHANNELS);
	}
	setBaseTerrain() {
		this.baseTerrain.set(this);
	}
	getBaseTerrain(x: number, y: number) {
		return this.baseTerrain[this.idx(x, y) + TERRAIN];
	}

	idx(x: number, y: number): number {
		if (x >= this.width) x = this.width - 1;
		if (x < 0) x = 0;
		if (y >= this.height) y = this.height - 1;
		if (y < 0) y = 0;
		return (y * this.width + x) * NUM_CHANNELS;
	}

	get(x: number, y: number, channel: number): number {
		return this[this.idx(x, y) + channel];
	}

	setAt(x: number, y: number, channel: number, value: number) {
		this[this.idx(x, y) + channel] = value;
	}

	getVx(x: number, y: number): number {
		return this.get(x, y, VX);
	}

	setVx(x: number, y: number, value: number) {
		this.setAt(x, y, VX, value);
	}

	getVy(x: number, y: number): number {
		return this.get(x, y, VY);
	}

	setVy(x: number, y: number, value: number) {
		this.setAt(x, y, VY, value);
	}

	getWater(x: number, y: number): number {
		return this.get(x, y, WATER);
	}

	setWater(x: number, y: number, value: number) {
		this.setAt(x, y, WATER, value);
	}

	getTerrain(x: number, y: number): number {
		return this.get(x, y, TERRAIN);
	}

	setTerrain(x: number, y: number, value: number) {
		this.setAt(x, y, TERRAIN, value);
	}
}
