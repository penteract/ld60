type ProgramInfo = {
	program: WebGLProgram;
	attribLocations: { vertexPosition: number };
	uniformLocations: {
		resolution: WebGLUniformLocation;
		waterData: WebGLUniformLocation;
		worldSize: WebGLUniformLocation;
	};
};

type Buffers = { position: WebGLBuffer };

type CanvasState = {
	gl: WebGL2RenderingContext;
	buffers: Buffers;
	programInfo: ProgramInfo;
};

export type { ProgramInfo, Buffers, CanvasState };
