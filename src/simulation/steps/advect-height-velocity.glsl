vec4 simulationStep() {
	vec4 here = simData(pos);

	vec2 newVelocity = vec2(0.0, 0.0);

	// Vx(simData(pos)) is the x velocity at pos-(0.5,0)

	// We want to compute the new x velocity at pos-(0.5,0)
	// and the new y velocity at pos-(0,0.5)
	// so:
	float vyForx = Vy(simData(pos + vec2(-0.5, 0.5) * unit));
	vec2 offsetx = pos - dt * vec2(Vx(here), vyForx);
	vec4 originx = simData(offsetx);
	if (WET(simData(offsetx + vec2(-0.5, 0.0) * unit)))
		newVelocity.x = Vx(originx);

	// To get x velocity at pos-(0,0.5) we need Vx(simData(pos+??))
	float vxFory = Vx(simData(pos + vec2(0.5, -0.5) * unit));
	vec2 offsety = pos - dt * vec2(vxFory, Vy(here));
	vec4 originy = simData(offsety);
	if (WET(simData(offsety + vec2(0.0, -0.5) * unit)))
		newVelocity.y = Vy(originy);

	return vec4(newVelocity, H(here), T(here));
}
