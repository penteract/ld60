#version 300 es

precision mediump float;

uniform vec2 uResolution;
uniform sampler2D uWaterData;
out vec4 fragColor;
const vec3 sunpos = vec3(0.5, 0.5, 1024.0);
const vec3 viewpos = vec3(0.5, 0.5, 2.0);
const float specularStrength = 0.5;
const vec3 sunlight = vec3(1.0, 0.98, 0.94);
const float heightScale = 20.0 / 128.0;
const float waterOpacityScale = 30.0;

vec4 groundColorCalc(float groundHeight) {
	vec4 seabedColorRGB = vec4(0.3, 0.3, 0.3, 1.0);
	vec4 grassColorRGB = vec4(0.7, 0.9, 0.7, 1.0);

	if (0.0 <= groundHeight && groundHeight < 0.1) {
		return ((0.05 - groundHeight) * seabedColorRGB +
			groundHeight * grassColorRGB) *
		20.0;
	}

	return grassColorRGB;
}

vec4 baseColor(float waterHeight, float groundHeight) {
	vec4 groundColor = groundColorCalc(groundHeight);
	vec4 waterColor = vec4(0.0, 0.0, 1.0, (1.0 - exp(-waterOpacityScale * waterHeight)) / (1.2 - exp(-waterOpacityScale)));

	return vec4(waterColor.rgb * waterColor.a + groundColor.rgb * groundColor.a * (1.0 - waterColor.a), 1.0);
}

void main() {
	vec2 uv = gl_FragCoord.xy / uResolution;

	vec4 coordinateWaterData = texture(uWaterData, uv);

	float groundHeight = min(coordinateWaterData.a / heightScale, 1.0);
	float waterHeight = min(coordinateWaterData.b / heightScale, 1.0);

	vec4 baseSurfaceColor = baseColor(waterHeight, groundHeight);

	vec3 pos = vec3(gl_FragCoord.xy, waterHeight);
	float k = 12.0 ;
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

	fragColor = vec4((ambient + diffuse + specular) * baseSurfaceColor.rgb, 1.0);
}
