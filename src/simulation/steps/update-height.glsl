uniform float drainageAmount;
uniform float minFluxArea;
uniform sampler2D outflowScales;

const float wettingThreshold = 0.000001;
const float newlyWetHeight = 0.0000003;

float scale(vec2 pos) {
    if (pos.x < 0.0 || pos.x > 1.0 || pos.y < 0.0 || pos.y > 1.0)
        return 1.0;
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
}
