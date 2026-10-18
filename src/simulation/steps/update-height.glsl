uniform float drainageAmount;
uniform float minFluxArea;
uniform sampler2D outflowScales;

const float wettingThreshold = 0.000001;
const float newlyWetHeight = 0.0000003;

float scale(vec2 pos) {
	return texture2D(outflowScales, pos).r;
}

vec4 simulationStep() {
	vec4 here = simData(pos);
	vec4 X1 = simData(posLeft);
	vec4 X2 = simData(posRight);
	vec4 Y1 = simData(posTop);
	vec4 Y2 = simData(posBottom);

	vec4 flow = edgeFlow(here, X1, Y1, X2, Y2);

	float leftV = Vx(here);
	float rightV = Vx(X2);
	float topV = Vy(here);
	float bottomV = Vy(Y2);
	float hereScale = scale(pos);
	float newHeight = H(here);

	newHeight += LEFT(flow) * (leftV >= 0.0 ? scale(posLeft) : hereScale);
	newHeight -= RIGHT(flow) * (rightV < 0.0 ? scale(posRight) : hereScale);
	newHeight += TOP(flow) * (topV >= 0.0 ? scale(posTop) : hereScale);
	newHeight -= BOTTOM(flow) * (bottomV < 0.0 ? scale(posBottom) : hereScale);
	return vec4(V(here), newHeight, T(here));
	//vec2 up = vec2(H(Y2),V
	/*

	float dVelocityX = (Vx(X2) - Vx(here)) / unit; // (Vx(X2) - Vx(X1)) / (2.0 * unit);
	float dVelocityY = (Vy(Y2) - Vy(here)) / unit; //(Vy(Y2) - Vy(Y1)) / (2.0 * unit);
	float velocityDivergence = dVelocityX + dVelocityY;

	float newHeight;
	if (H(here) <= 0.0) {
		if (
			H(X1) > wettingThreshold && L(X1) > T(here) + wettingThreshold ||
			H(X2) > wettingThreshold && L(X2) > T(here) + wettingThreshold ||
			H(Y1) > wettingThreshold && L(Y1) > T(here) + wettingThreshold ||
			H(Y2) > wettingThreshold && L(Y2) > T(here) + wettingThreshold
		) {
			newHeight = newlyWetHeight;
		} else newHeight = H(here);
	} else
	{
		float fluxArea = max(H(here), minFluxArea);
		newHeight = H(here) - fluxArea * velocityDivergence * dt;
		newHeight -= drainageAmount;
		newHeight = max(-0.00001, newHeight);
		//newHeight = min(H(here) * 2.0, newHeight);
	}

	return vec4(V(here), newHeight, T(here));
	*/
}
