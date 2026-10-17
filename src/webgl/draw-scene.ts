import type {Buffers, ProgramInfo,CanvasState} from "./types.ts";

function drawScene(canvasState:CanvasState, water:number[][], ground:number[][], nX: number, nY: number) {
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

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);


    let buildingArray = []

    const MAX_HEIGHT = 500;

    for(let i = 0; i < water.length; i++) {
        const waterRow = water[i];
        const groundRow = ground[i];
        for(let j = 0; j < water.length; j++) {
            buildingArray.push(0, Math.floor(Math.min(groundRow[j] / MAX_HEIGHT, 1.0) * 255), Math.floor(Math.min(waterRow[j] / MAX_HEIGHT, 1.0) * 255), 0);
        }
    }


    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, nX, nY, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(buildingArray), );

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

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
