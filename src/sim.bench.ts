import { test } from "vitest";
import { init, step } from "./sim";

test("step()", async ({ bench }) => {
	const sim = init();
	await bench(`step() on ${sim.width}x${sim.height}`, () => step(sim)).run({
		warmupTime: 200,
		time: 2000,
	});
});
