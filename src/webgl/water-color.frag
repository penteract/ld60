#version 100

precision mediump float;

uniform vec2 uResolution;
uniform sampler2D uWaterData;

void main() {
    vec2 unrotated = (gl_FragCoord.xy / uResolution);

    vec2 uv = mat2(0, 1, -1, 0) * (unrotated - vec2(0.5, 0.5)) + vec2(0.5, 0.5);

    vec4 coordinateWaterData = texture2D(uWaterData, uv);

    float groundHeight = coordinateWaterData.g;
    float waterHeight = coordinateWaterData.b;

    float waterOverGround = max((waterHeight - groundHeight) - 0.01, 0.0);

    float groundColor = clamp(exp(-waterOverGround * 6.0), 0.0, 1.0);
    float waterColor = clamp((1.0 - exp(-100.0 * waterOverGround)) * exp(-waterOverGround), 0.0, 1.0);
    float redColor = clamp(0.7 * exp(-200.0 * waterOverGround), 0.0, 1.0 );

    gl_FragColor = vec4(redColor, groundColor, waterColor, 1.0);
}