// renders into the metrics map, not the state texture
uniform sampler2D metrics;

vec4 simulationStep() {
	vec4 here = simData(pos);
	vec4 mHere = texture2D(metrics, pos);

	return vec4(
		max(mHere.x, abs(Vx(here))),
		max(mHere.y, abs(Vy(here))),
		max(mHere.z, H(here)),
		0.0
	);
}
