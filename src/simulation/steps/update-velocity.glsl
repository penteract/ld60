/*
GLOW.Compiler.compileFragmentShader: WARNING: 0:82: '=' : global variable initializers should be constant expressions (uniforms and globals are allowed in global initializers for legacy compatibility)
ERROR: 0:111: 'fas' : undeclared identifier
ERROR: 0:111: 'asdf' : syntax error
*/

float maxVelocity = 0.5 * unit / dt;
uniform float manningCoefficient;
uniform float gravity;

uniform sampler2D frictionMap;

vec4 simulationStep() {
	vec4 here = simData(pos);

	vec4 X1 = simData(posLeft);
	//vec4 X2 = simData(posRight);
	vec4 Y1 = simData(posTop);
	//vec4 Y2 = simData(posBottom);

	vec2 Hends = vec2(H(here), H(here));
	vec2 Hstarts = vec2(H(X1), H(Y1));
	vec2 Tends = vec2(T(here), T(here));
	vec2 Tstarts = vec2(T(X1), T(Y1));
	vec2 endLevels = Tends + Hends;
	vec2 startLevels = Tstarts + Hstarts;

	//if (ht.x < 0.0) return vec4(0.0, 0.0, ht);

	// boundary: assume water is flat until shoreline
	/*
	float L_X1 = H(X1) < 0.0 && T(X1) > L(here) ? L(here) : L(X1);
	float L_X2 = H(X2) < 0.0 && T(X2) > L(here) ? L(here) : L(X2);
	float L_Y1 = H(Y1) < 0.0 && T(Y1) > L(here) ? L(here) : L(Y1);
	float L_Y2 = H(Y2) < 0.0 && T(Y2) > L(here) ? L(here) : L(Y2);*/
	vec2 slope = (endLevels - startLevels) / unit; //vec2(L_X2 - L_X1, L_Y2 - L_Y1) / (2.0 * unit);

	float n = manningCoefficient;
	n *= texture2D(frictionMap, pos).x;
	vec2 p = vec2(
		pow((Hends.x + Hstarts.x) / 2.0, 4.0 / 3.0),
		pow((Hends.y + Hstarts.y) / 2.0, 4.0 / 3.0)
	);
	vec2 frictionSlope = V(here) * length(V(here)) * pow(n, 2.0) / p;

	vec2 totalSlope = slope + frictionSlope;

	// make sure new slope doesn't point in other direction
	totalSlope.x =
		slope.x < 0.0
			? min(totalSlope.x, 0.0)
			: max(totalSlope.x, 0.0);
	totalSlope.x = slope.x == 0.0 ? 0.0 : totalSlope.x;
	totalSlope.y =
		slope.y < 0.0
			? min(totalSlope.y, 0.0)
			: max(totalSlope.y, 0.0);
	totalSlope.y = slope.y == 0.0 ? 0.0 : totalSlope.y;

	vec2 newVelocity = V(here) - gravity * totalSlope * dt;

	if (length(newVelocity) > maxVelocity)
		newVelocity *= maxVelocity / length(newVelocity);
	//TODO at bottom if H(X1)==0 then vx <=0 (and 3 similar) -- vx<=X1

	//if (H(X1) < 0.0 || H(X2) < 0.0) newVelocity.x = 0.0;
	//if (H(Y1) < 0.0 || H(Y2) < 0.0) newVelocity.y = 0.0;

	return vec4(newVelocity, H(here), T(here));
}
