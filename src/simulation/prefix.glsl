#ifdef GL_ES
precision highp float;
#endif

// main texture and uniform inputs

uniform sampler2D texture;
uniform float unit, time, dt;
uniform float sourceWaterHeight;
uniform float sourceWaterVelocity;
uniform float dryDepth;

// current and neighbor positions, passed from vertex shader
varying vec2 pos, posLeft, posRight, posTop, posBottom;

// macros to access components of simulation data vector

#define V(D) (D).xy // velocity
#define Vx(D) (D).x // velocity (x-component)
#define Vy(D) (D).y // velocity (y-component)
#define H(D) (D).z // water height
#define T(D) (D).w // terrain height
#define L(D) (H(D) + T(D)) // water level

#define WET(D) (H(D) > dryDepth)
#define DRY(D) (H(D) <= dryDepth)

// query (and interpolate) simulation data from texture
vec4 simData(vec2 pos) {
	vec4 data = texture2D(texture, pos);
	float minExtent = 0.5 * unit;
	float maxExtent = 1.0 - 0.5 * unit;

	// x heights
	if (pos.x < 0.0) {
		vec4 borderData = texture2D(
			texture,
			vec2(minExtent, clamp(pos.y, minExtent, maxExtent))
		);
		data.z = borderData.z;
		data.w = borderData.w;
	} else if (pos.x > maxExtent) {
		vec4 borderData = texture2D(
			texture,
			vec2(maxExtent, clamp(pos.y, minExtent, maxExtent))
		);
		data.x = max(borderData.x, 0.0);
		data.z = borderData.z;
		data.w = borderData.w;
	} else if (pos.x < unit) {
		vec4 borderData = texture2D(
			texture,
			vec2(minExtent + unit, clamp(pos.y, minExtent, maxExtent))
		);
		data.x = min(borderData.x, 0.0);
	}

	if (pos.y < 0.0) {
		// flow in with sourceWaterHeight and sourceWaterVelocity
		vec4 borderData = texture2D(
			texture,
			vec2(clamp(pos.x, minExtent, maxExtent), minExtent)
		);
		data.z = sourceWaterHeight - borderData.w;
		data.w = borderData.w;
	} else if (pos.y > maxExtent) {
		vec4 borderData = texture2D(
			texture,
			vec2(clamp(pos.x, minExtent, maxExtent), maxExtent)
		);
		data.y = max(borderData.y, 0.0);
		data.z = borderData.z;
		data.w = borderData.w;
	} else if (pos.y < unit) {
		// flow in with sourceWaterVelocity
		if (sourceWaterVelocity > 0.0)
			data.y = sourceWaterHeight > data.w ? sourceWaterVelocity : 0.0;
		// if source velocity is <= 0, we don't set it to allow it to be set by
		// advection and the slope
	}

	return data;
}

#define LEFT(V) (V).x
#define TOP(V) (V).y
#define RIGHT(V) (V).z
#define BOTTOM(V) (V).w

float fluxArea(vec4 source, vec4 target) {
	return max(min(L(source) - T(target), H(source)), 0.0);
}

vec4 edgeFlow(vec4 here, vec4 X1, vec4 Y1, vec4 X2, vec4 Y2) {
	float leftV = Vx(here);
	float rightV = Vx(X2);
	float topV = Vy(here);
	float bottomV = Vy(Y2);

	float leftFlux = leftV >= 0.0 ? fluxArea(X1, here) : fluxArea(here, X1);
	float rightFlux = rightV >= 0.0 ? fluxArea(here, X2) : fluxArea(X2, here);
	float topFlux = topV >= 0.0 ? fluxArea(Y1, here) : fluxArea(here, Y1);
	float bottomFlux = bottomV >= 0.0 ? fluxArea(here, Y2) : fluxArea(Y2, here);

	return dt *
	vec4(
		leftFlux * leftV,
		topFlux * topV,
		rightFlux * rightV,
		bottomFlux * bottomV
	) /
	unit;
}

// forward declare simulationStep
// will be implemented by simulation shader

vec4 simulationStep();

// use return value of simulationStep as output color

void main(void ) {
	gl_FragColor = simulationStep();
}
