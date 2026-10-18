vec4 simulationStep() {
	vec4 here = simData(pos);

	if (H(here) <= 0.0) return vec4(V(here), H(here), T(here));

	vec4 origin = simData(pos - dt * V(here));
	//vec2 newVelocity = V(origin);
	vec2 newVelocity = mix(V(here),V(origin),clamp(H(origin)/H(here),0.,1.));
	return vec4(newVelocity, H(here), T(here));
	//return here;
}
