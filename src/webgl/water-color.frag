#version 300 es

precision mediump float;

uniform vec2 uResolution;
uniform sampler2D uWaterData;
out vec4 fragColor;
const vec3 sunpos = vec3(0.5, 0.5, 1024.0);
const vec3 viewpos = vec3(0.5, 0.5, 2.0);
const float specularStrength = 0.1;
const vec3 sunlight = vec3(1.0, 0.98, 0.94);
const float heightScale = 20.0 / 128.0;
const float waterOpacityScale = 30.0;
const vec3 waterColor = vec3(0.0, 0.1, 0.2);
const vec3 waterAbsorption = vec3(0.45, 0.09, 0.06) * 256.0;
const vec3 skyColor = vec3(0.3, 0.7, 0.9);

vec3 groundColorCalc(float groundHeight) {
	vec3 seabedColorRGB = vec3(0.3, 0.3, 0.3);
	vec3 damRGB = vec3(0.1, 0.4, 0.1);

	return groundHeight < 0.1 ? seabedColorRGB : damRGB;
}

vec3 applyWater(vec3 bedColor, float waterHeight, float groundHeight) {
	float waterSurface = waterHeight + groundHeight;
	vec3 bedAmbient = 0.3 * sunlight;

	float k = 12.0;

	float bedDx = dFdx(groundHeight) * 200.0;
	float bedDy = dFdy(groundHeight) * 200.0;

	vec3 bedNormal = normalize(vec3(-bedDx, -bedDy, 1));
	vec3 bedDiffuse = 0.7 * max(dot(bedNormal, vec3(0, 0, 1)), 0.0) * sunlight;

	vec3 baseBed = (bedAmbient + bedDiffuse) * bedColor;

	if (waterHeight <= 0.0) return baseBed;

	float waterDx = dFdx(waterSurface) * k;
	float waterDy = dFdy(waterSurface) * k;

	vec3 waterNormal = normalize(vec3(-waterDx, -waterDy, 1));

	vec3 lightAbsorption = exp(-waterHeight * waterAbsorption);

	vec3 mixBedAndWater =
		baseBed * lightAbsorption + waterColor * (1.0 - lightAbsorption);

	float fresnelCoef = 0.02 + 0.98 * pow(1.0 - max(waterNormal.z, 0.0), 5.0);

	vec3 specularReflection = sunlight * specularStrength *  pow(max(waterNormal.z, 0.0), 200.0);

	vec3 colorWithReflections = mix(mixBedAndWater, skyColor, fresnelCoef) + specularReflection;

	vec3 smoothWaterEdge = mix(bedColor, colorWithReflections, smoothstep(0.0, 0.0008, waterHeight));

	return smoothWaterEdge;
}

vec3 baseColor(float waterHeight, float groundHeight) {
	vec3 groundColor = groundColorCalc(groundHeight);

	return applyWater(groundColor, waterHeight, groundHeight);
}

void main() {
	vec2 uv = gl_FragCoord.xy / uResolution;

	vec4 coordinateWaterData = texture(uWaterData, uv);

	float groundHeight = min(coordinateWaterData.a / heightScale, 1.0);
	float waterDepth = min(coordinateWaterData.b / heightScale, 1.0);

	vec3 baseSurfaceColor = baseColor(waterDepth, groundHeight);

	float waterHeight = min(
		(coordinateWaterData.a + coordinateWaterData.b) / heightScale,
		1.0
	);

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

	fragColor = vec4(baseSurfaceColor.rgb, 1.0);
}
