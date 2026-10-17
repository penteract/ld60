import type {Buffers, ProgramInfo,CanvasState} from "./types.ts";

function drawScene(canvasState:CanvasState) {
    const {gl, programInfo, buffers} = canvasState
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    const canvas = gl.canvas;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    setPositionAttribute(gl, programInfo, buffers);

    gl.useProgram(programInfo.program);

    gl.uniform2f(programInfo.uniformLocations.resolution, canvas.width, canvas.height);

    const offset = 0;
    const vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);

}

function setPositionAttribute(gl: WebGL2RenderingContext, programInfo: ProgramInfo, buffers: Buffers) {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset,
    )
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}

export {drawScene}
