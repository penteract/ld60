// SimState is the interface between the sim and js.
// It is modeled on the shape of the state texture in WebFlood.

// the number of elements per loc'n
const NUM_CHANNELS = 4;

const VX = 0;
const VY = 1;
const WATER = 2;
const TERRAIN = 3;

export class SimState extends Float32Array {
	width: number;
	height: number;
	pumps: [[number, number], [number, number]][];

	constructor(width: number, height: number) {
		super(width * height * NUM_CHANNELS);
		this.width = width;
		this.height = height;
		this.pumps = [];
	}

	idx(x: number, y: number): number {
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

	getGround(x: number, y: number): number {
		return this.get(x, y, TERRAIN);
	}

	setTerrain(x: number, y: number, value: number) {
		this.setAt(x, y, TERRAIN, value);
	}
}
