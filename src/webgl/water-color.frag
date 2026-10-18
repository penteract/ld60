#version 300 es

precision mediump float;

uniform vec2 uResolution;
uniform sampler2D uWaterData;
out vec4 fragColor;
const vec3 sunpos = vec3(0.5, 1.0, 4.0);
const vec3 viewpos = vec3(0.5, 0.5, 2.0);
const float specularStrength = 0.5;
const vec3 sunlight = vec3(1.0, 0.98, 0.94);

vec3 groundColorCalc(float groundHeight) {
	vec3 seabedColorRGB = vec3(0.3, 0.3, 0.3);
	vec3 shoreColorRGB = vec3(0.7, 0.7, 0.0);
	vec3 grassColorRGB = vec3(0.1, 1.0, 0.0);

	if (0.0 <= groundHeight && groundHeight < 0.5) {
		return ((0.5 - groundHeight) * seabedColorRGB + groundHeight * shoreColorRGB) * 2.0;
	}

	if (0.5 <= groundHeight && groundHeight < 0.7) {
		return ((0.7 - groundHeight) * shoreColorRGB + (groundHeight - 0.5) * grassColorRGB) * 5.0;
	}


	return grassColorRGB;
}

vec3 baseColor(float waterHeight, float groundHeight) {
	float waterOverGround = max(waterHeight - groundHeight, 0.0);
	vec3 groundColorRGB = groundColorCalc(groundHeight);

	float groundColorFilter = clamp(exp(-waterOverGround * 6.0), 0.0, 1.0);
	float waterColorFilter = clamp(
		(1.0 - exp(-100.0 * waterOverGround)) * exp(-waterOverGround),
		0.0,
		1.0
	);
	return groundColorFilter * groundColorRGB + waterColorFilter * vec3(0.0, 0.0, 1.0);
}

void main() {
	vec2 uv = gl_FragCoord.xy / uResolution;

	vec4 coordinateWaterData = texture(uWaterData, uv);

	float groundHeight = coordinateWaterData.a;
	float waterHeight = coordinateWaterData.b;

	vec3 baseSurfaceColor = baseColor(waterHeight, groundHeight);

	vec3 pos = vec3(gl_FragCoord.xy, waterHeight);
	float k = 12.0;
	float dx = dFdx(waterHeight) * k;
	float dy = dFdy(waterHeight) * k;
	vec3 t1 = vec3(1.0, 0.0, dx);
	vec3 t2 = vec3(0.0, 1.0, dy);
	vec3 normal = normalize(vec3(-dx, -dy, 1));
	// TODO: compute better normals and work out specular stuff
	vec3 ambient = 0.1 * sunlight;
	vec3 lightDir = normalize(sunpos - vec3(uv, waterHeight));
	vec3 diffuse = max(dot(normal, lightDir), 0.0) * sunlight;

	vec3 viewDir = normalize(viewpos - vec3(uv, waterHeight));
	vec3 reflectDir = reflect(-lightDir, normal);
	float spec = pow(max(dot(viewDir, reflectDir), 0.0), 256.0);
	vec3 specular = specularStrength * spec * sunlight;

	fragColor = vec4((ambient + diffuse + specular) * baseSurfaceColor, 1.0);
}
