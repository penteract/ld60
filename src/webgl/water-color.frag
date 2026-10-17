#version 100

precision mediump float;

uniform vec2 uResolution;
uniform vec2 uGridDimensions;
uniform sampler2D uWaterData;

void main() {
    vec2 unrotated = (gl_FragCoord.xy / uResolution);

    vec2 uv = mat2(0, 1, -1, 0) * (unrotated - vec2(0.5, 0.5)) + vec2(0.5, 0.5);

    vec2 tileCoords = floor(uv * uGridDimensions) / uGridDimensions;

    vec4 coordinateWaterData = texture2D(uWaterData, tileCoords);

    gl_FragColor = vec4(coordinateWaterData.rgb, 1.0);
}