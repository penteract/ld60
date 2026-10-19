// renders into the outflowScales map, not the state texture

vec4 simulationStep() {
	vec4 here = simData(pos);

	if (DRY(here)) return vec4(0.0);

	vec4 flow = edgeFlow(
		here,
		simData(posLeft),
		simData(posTop),
		simData(posRight),
		simData(posBottom)
	);

	float outFlow =
		-min(LEFT(flow), 0.0) -
		min(TOP(flow), 0.0) +
		max(RIGHT(flow), 0.0) +
		max(BOTTOM(flow), 0.0);

	float outflowScale = 1.0;
	//if (outFlow > max(H(here),0.0)) outflowScale = max(H(here),0.0) / outFlow;
	if (outFlow > H(here)) outflowScale = H(here) / outFlow;

	return vec4(outflowScale);
}
