vec4 simulationStep() {
	vec4 here = simData(pos);

	if (H(here) <= 0.0) return vec4(V(here), H(here), T(here));

	vec4 origin = simData(pos - dt * V(here));
	vec2 newVelocity = V(origin);

	return vec4(newVelocity, H(here), T(here));
	return here;
}
