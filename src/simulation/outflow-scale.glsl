// renders into the outflowScales map (scale in .r, via gl_FragColor), not the
// state texture; floodsim.ts handles the different target

vec4 simulationStep() {
	vec4 here = simData(pos);

	if (H(here) < 0.0) return vec4(0.0);

	// vec4 flux = edgeFlux(
	// 	here,
	// 	simData(posLeft),
	// 	simData(posTop),
	// 	simData(posRight),
	// 	simData(posBottom)
	// );

	// flux = min(L-T', H) * velocity * dt / unit

	// water height this cell would lose this tick, as a ratio of H
	float outHeight = dt * 1.0 / unit;

	float outflowScale = 1.0;
	if (outHeight > H(here)) outflowScale = H(here) / outHeight;

	// outflow = vec4();

	return vec4(outflowScale);
}
