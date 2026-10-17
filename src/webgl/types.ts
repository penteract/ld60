type ProgramInfo = {
    program: WebGLProgram;
    attribLocations: { vertexPosition: number, };
    uniformLocations: {
        gridDimensions: WebGLUniformLocation;
        resolution: WebGLUniformLocation;
        waterData: WebGLUniformLocation;
    }
}

type Buffers = { position: WebGLBuffer };

type CanvasState = {
    gl: WebGL2RenderingContext,
    buffers: Buffers,
    programInfo: ProgramInfo
}

export type {ProgramInfo, Buffers, CanvasState};
