import type {Buffers} from "./types.ts";

function initPositionBuffer(gl: WebGL2RenderingContext) {
    const positionBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions: number[] = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    return positionBuffer;
}

function initBuffers(gl: WebGL2RenderingContext): Buffers {
    const positionBuffer = initPositionBuffer(gl);

    return {
        position: positionBuffer,
    }
}

export { initBuffers }
