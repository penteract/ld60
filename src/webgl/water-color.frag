#version 300 es

precision mediump float;

uniform vec2 uResolution;
uniform sampler2D uWaterData;
out vec4 fragColor;
const vec3 sunpos = vec3(1.0, 0.0, 3.0);

void main() {
	vec2 uv = gl_FragCoord.xy / uResolution;

	vec4 coordinateWaterData = texture(uWaterData, uv);

	float groundHeight = coordinateWaterData.g;
	float waterHeight = coordinateWaterData.b;

	vec3 pos = vec3(gl_FragCoord.xy, waterHeight);
	float k = 12.0;
	vec3 t1 = vec3(1.0, 0.0, dFdx(waterHeight) * k);
	vec3 t2 = vec3(0.0, 1.0, dFdy(waterHeight) * k);
	vec3 normal = normalize(cross(t1, t2)); // this could be simpler given the 1s and 0s above
	// TODO: compute better normals and work out specular stuff

	float waterOverGround = max(waterHeight - groundHeight - 0.01, 0.0);

	float groundColor = clamp(exp(-waterOverGround * 6.0), 0.0, 1.0);
	float waterColor = clamp(
		(1.0 - exp(-100.0 * waterOverGround)) * exp(-waterOverGround),
		0.0,
		1.0
	);
	float redColor = clamp(0.2 * dot(normal, sunpos), 0.0, 1.0); //clamp(0.7 * exp(-200.0 * waterOverGround), 0.0, 1.0);
	vec3 col = vec3(redColor, groundColor, waterColor);
	float ambient = 0.1;
	float diffuse = clamp(0.2 * dot(normal, sunpos), 0.0, 0.9);

	fragColor = vec4(col * (ambient + diffuse), 1.0);
}
