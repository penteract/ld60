import waterPlaneShader from './water-plane.vert?raw'
import waterColorShader from './water-color.frag?raw'
import type {ProgramInfo} from "./types.ts";
import {initBuffers} from "./init-buffers.ts";
import {drawScene} from "./draw-scene.ts";

export function setup(canvas) : CanvasState {
  //const canvas = document.querySelector('#waterworld-canvas');

  if (!checkCanvas(canvas)) {
    alert('canvas is not present');
    return;
  }

  const gl = canvas.getContext('webgl2');

  if (gl === null) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }

  const shaderProgram = initShaderProgram(gl, waterPlaneShader, waterColorShader);
  if (shaderProgram == null) {
    alert('no program available');
    return;
  }

  const resolution = gl.getUniformLocation(shaderProgram, "uResolution");
  if (resolution == null) {
    console.log('resolution is not found');
    return;
  }

  const programInfo: ProgramInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram,"aVertexPosition"),
    },
    uniformLocations: {
      resolution: resolution,
    }
  }

  const buffers = initBuffers(gl);
  return {
    gl: gl,
    buffers: buffers,
    programInfo: programInfo
  }
  //drawScene(gl, programInfo, buffers);
}

function initShaderProgram(gl: WebGL2RenderingContext, vsSource: string, fsSource: string) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  if (vertexShader == null || fragmentShader == null) {
    alert('failed to load shaders');
    return null;
  }

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
        `Unable to initialize the shader program: ${gl.getProgramInfoLog(
            shaderProgram,
        )}`,
    );
    return null;
  }

  return shaderProgram;
}

function loadShader(gl: WebGL2RenderingContext, type: GLenum, source: string): WebGLShader | null {
  const shader = gl.createShader(type);

  if(shader == null) {
    alert('error creating shader');
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
        `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`,
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function checkCanvas(element: Element | null): element is HTMLCanvasElement{
  return (element as HTMLCanvasElement).getContext !== undefined;
}
