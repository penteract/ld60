import { SimState } from "./simstate";

export var W = 50;
export var H = 50;
export var dt = 1 / 40;

// assumes state's water >= terrain

export function init(): SimState {
	return new SimState(W, H);
}

export function step(sim: SimState) {
	for (let xy = 0; xy < W + H - 1; xy++) {
		for (let x = Math.max(0, xy - (H - 1)); x < Math.min(W, xy + 1); x++) {
			let y = xy - x;
			//console.log(x,y)
			if (x == 0 || x == W - 1 || y == 0 || y == H - 1) {
				sim.setWater(x, y, W + H - xy * 0.1);
			}
			if (x > 0 && y > 0) {
				for (let [dx, dy] of [
					[-1, 0],
					[0, -1],
				]) {
					let w = sim.getWater(x + dx, y + dy);
					let g = sim.getTerrain(x + dx, y + dy);
					let hd = sim.getWater(x, y) - w;
					let flow = hd * dt;
					// can't have more flowing out than the amount of water above ground on the tile
					flow = Math.max(flow, g - w);
					flow = Math.min(flow, sim.getWater(x, y) - sim.getTerrain(x, y));
					sim.setWater(x, y, sim.getWater(x, y) - flow);
					sim.setWater(x + dx, y + dy, w + flow);
				}
			}
		}
	}
}
