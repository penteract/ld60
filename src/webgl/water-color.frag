#version 100

precision mediump float;

uniform vec2 uResolution;

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution * vec2(1, -1) + vec2(0, 1);

    gl_FragColor = vec4(0.0, 0.0, (uv.x + uv.y) / 2.0, 1.0);
}