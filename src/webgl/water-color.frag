#version 100

precision mediump float;

uniform vec2 uResolution;
uniform vec2 uGridDimensions;

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution * vec2(1, -1) + vec2(0, 1);

    vec2 tiles = floor(uv * uGridDimensions) / uGridDimensions;

    gl_FragColor = vec4(0.0, 0.0, (tiles.x + tiles.y) / 2.0, 1.0);
}