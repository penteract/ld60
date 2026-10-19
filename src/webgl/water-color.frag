#version 300 es

precision mediump float;

uniform vec2 uResolution;
uniform sampler2D uWaterData;
// width of the map in m; one sim unit == worldSize
uniform float uWorldSize;
out vec4 fragColor;
const float specularStrength = 0.5;
const vec3 sunlight = vec3(1.0, 0.98, 0.94);
const float waterOpacityScale = 30.0;
const vec3 waterColor = vec3(0.0, 0.1, 0.2);
const vec3 waterAbsorption = vec3(0.45, 0.09, 0.06) * 128.0;
const vec3 skyColor = vec3(0.3, 0.7, 0.9);
const vec3 sunDir = normalize(vec3(0.4 , 0.3   , 0.86 ));

const vec3 viewerPos = vec3(0.5, 0.5, 1.5 );

vec3 groundColorCalc(float groundHeight) {
	vec3 seabedColorRGB = vec3(0.3, 0.3, 0.3);
	vec3 damRGB = vec3(0.1, 0.4, 0.1);

	return mix(seabedColorRGB, damRGB, smoothstep(0.0, 1.0, groundHeight * 5.0));

	//return groundHeight < 0.1 ? seabedColorRGB: damRGB;

}

vec3 applyWater(vec3 bedColor, float waterHeight, float groundHeight) {
	float waterSurface = waterHeight + groundHeight;
	vec3 bedAmbient = 0.5 * sunlight;

	float k = 12.0;

	float bedDx = dFdx(groundHeight) * 200.0;
	float bedDy = dFdy(groundHeight) * 200.0;

	vec3 bedNormal = normalize(vec3(-bedDx, -bedDy, 1));
	// bedNormal = vec3(0.,0.,1.);
	vec3 bedDiffuse =
		0.5 * max(dot(bedNormal, sunDir ), 0.0) * sunlight;

	vec3 baseBed = (bedAmbient + bedDiffuse) * bedColor;

	//if (waterHeight <= 0.0) return baseBed;

	float waterDx = dFdx(waterSurface) * k;
	float waterDy = dFdy(waterSurface) * k;

	vec3 waterNormal = normalize(vec3(-waterDx, -waterDy, 1));

	vec3 lightAbsorption = exp(-waterHeight * waterAbsorption);

	vec3 mixBedAndWater =
		baseBed * lightAbsorption + waterColor * (1.0 - lightAbsorption);

	vec2 uv = gl_FragCoord.xy / uResolution  ;

	vec3 viewerDir = normalize(viewerPos - vec3(uv, 0.0));
	vec3 reflectDir = reflect(-sunDir, waterNormal);

	float fresnelCoef = 0.02 + 0.98 * pow(1.0 - max(dot(viewerDir, waterNormal), 0.0), 5.0);

	vec3 specularReflection =
		sunlight * specularStrength * pow(max(dot(viewerDir, reflectDir), 0.0), 200.0) ;

	vec3 colorWithReflections =
		mix(mixBedAndWater, skyColor, fresnelCoef) + specularReflection;

	vec3 smoothWaterEdge = mix(
		baseBed,
		colorWithReflections,
		smoothstep(0.0, 0.0008, waterHeight)
	);

	return smoothWaterEdge;
}

vec3 baseColor(float waterHeight, float groundHeight) {
	vec3 groundColor = groundColorCalc(groundHeight);

	return applyWater(groundColor, waterHeight, groundHeight);
}

void main() {
	vec2 uv = gl_FragCoord.xy / uResolution;

	vec4 coordinateWaterData = texture(uWaterData, uv);

	float heightScale = 20.0 / uWorldSize;

	float groundHeight = min(coordinateWaterData.a / heightScale, 1.0);
	float waterDepth = min(coordinateWaterData.b / heightScale, 1.0);

	vec3 baseSurfaceColor = baseColor(waterDepth, groundHeight);

	fragColor = vec4(baseSurfaceColor, 1.0);
}
