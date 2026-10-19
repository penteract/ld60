float maxVelocity = 0.5 * unit / dt;
uniform float manningCoefficient;
uniform float gravity;

uniform sampler2D frictionMap;

bool isWall(vec4 point, vec4 target) {
	return DRY(point) && T(point) > L(target);
}

vec4 simulationStep() {
	vec4 here = simData(pos);

	vec4 X1 = simData(posLeft);
	vec4 Y1 = simData(posTop);

	vec2 Hends = vec2(H(here), H(here));
	vec2 Hstarts = vec2(H(X1), H(Y1));
	vec2 Tends = vec2(T(here), T(here));
	vec2 Tstarts = vec2(T(X1), T(Y1));
	/*
	float L_X1 = H(X1) < 0.0 && T(X1) > L(here) ? L(here) : L(X1);
	float L_X2 = H(X2) < 0.0 && T(X2) > L(here) ? L(here) : L(X2);
	float L_Y1 = H(Y1) < 0.0 && T(Y1) > L(here) ? L(here) : L(Y1);
	float L_Y2 = H(Y2) < 0.0 && T(Y2) > L(here) ? L(here) : L(Y2);*/
	vec2 endLevels = Tends + Hends;
	vec2 startLevels = Tstarts + Hstarts;

	vec2 slope = (endLevels - startLevels) / unit;

	float n = manningCoefficient;
	n *= texture2D(frictionMap, pos).x;
	vec2 Vx = V(simData(pos + vec2(0.0, -0.5)));
	vec2 Vy = V(simData(pos + vec2(-0.5, 0.0)));
	vec2 p = vec2(
		length(Vx) / pow(max((Hends.x + Hstarts.x) / 2.0, 0.00001), 4.0 / 3.0),
		length(Vy) / pow(max((Hends.y + Hstarts.y) / 2.0, 0.00001), 4.0 / 3.0)
	);
	vec2 friction = 1.0 + gravity * n * n * dt * p;

	vec2 newVelocity = (V(here) - gravity * slope * dt) / friction;

	if (isWall(here, X1) || isWall(X1, here)) newVelocity.x = 0.0;
	if (isWall(here, Y1) || isWall(Y1, here)) newVelocity.y = 0.0;

	if (length(newVelocity) > maxVelocity)
		newVelocity *= maxVelocity / length(newVelocity);
	//TODO at bottom if H(X1)==0 then vx <=0 (and 3 similar) -- vx<=X1

	//if (H(X1) < 0.0 || H(X2) < 0.0) newVelocity.x = 0.0;
	//if (H(Y1) < 0.0 || H(Y2) < 0.0) newVelocity.y = 0.0;

	return vec4(newVelocity, H(here), T(here));
}
