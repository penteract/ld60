#version 100

precision mediump float;

uniform vec2 uResolution;
uniform vec2 uGridDimensions;
uniform sampler2D uWaterData;

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution * vec2(1, -1) + vec2(0, 1);

    vec2 tileCoords = floor(uv * uGridDimensions) / uGridDimensions;

    vec4 coordinateWaterData = texture2D(uWaterData, tileCoords);

    gl_FragColor = vec4(coordinateWaterData.rgb, 1.0);
}