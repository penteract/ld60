import simulationVertexShader from "./vertex.glsl?raw";
import simulationPrefixShader from "./prefix.glsl?raw";
import outflowScaleShader from "./outflow-scale.glsl?raw";
import advectStepShader from "./steps/advect-height-velocity.glsl?raw";
import updateHeightStepShader from "./steps/update-height.glsl?raw";
import updateVelocityStepShader from "./steps/update-velocity.glsl?raw";

import { GLOW } from "./glow";
import { FlipFlopFBO } from "./flipflopfbo";
import { SimState } from "../simstate";
import { DamDry } from "./starts";
import { London } from "./startmap";

// time resolution of the simulation
// currently tied to framerate
const dt = 1 / 60;
// width and height resolution of the simulation
export const W = 256;
export const H = 256;

// world size in meters
export const WORLD_SIZE = 128;
const GRAVITY = 9.81;
// https://en.wikipedia.org/wiki/Manning_formula
// a coefficient for empirically determined friction for the surface.
// currently set to the value for a clean Earth channel from
// https://www.engineeringtoolbox.com/mannings-roughness-d_799.html
const MANNING_COEFFICIENT = 0.022;
// depth floor (m) in the divergence term, so near-dry cells still flow
const MIN_FLUX_AREA = 0.001;
// the depth of water (in m) below which a tile should be considered dry
const DRY_DEPTH = 0.001;

class FloodEngine {
	private gl: WebGL2RenderingContext;
	private steps: any[];
	private state: FlipFlopFBO;
	// per-cell outflow limiter, written by the outflow-scale step and read by
	// update-height
	private outflowScales: any;

	constructor() {
		let gl = document.createElement("canvas").getContext("webgl2");
		if (gl == null) {
			throw "No WebGL";
		}
		this.gl = gl;

		// load required WebGL extensions
		for (const ext of ["EXT_color_buffer_float", "OES_texture_float_linear"])
			if (gl.getExtension(ext) == null) throw `No ${ext}`;

		const context = new GLOW.Context({ context: gl });
		context.viewport = { x: 0, y: 0, width: W, height: H };

		this.outflowScales = new GLOW.FBO({
			width: W,
			height: H,
			internalFormat: gl.R32F,
			format: gl.RED,
			type: gl.FLOAT,
			magFilter: gl.NEAREST,
			minFilter: gl.NEAREST,
			depth: false,
			data: new Float32Array(W * H),
		});

		const makeStep = (stepShader: string, uniforms: Record<string, any>) =>
			new GLOW.Shader({
				vertexShader: simulationVertexShader,
				fragmentShader: simulationPrefixShader + "\n" + stepShader,
				data: {
					texture: undefined,
					vertices: GLOW.Geometry.Plane.vertices(),
					uvs: GLOW.Geometry.Plane.uvs(),
					unit: new GLOW.Float(1 / W),
					dt: new GLOW.Float(dt),
					// the y = 0 edge holds water at this depth + velocity
					sourceWaterHeight: new GLOW.Float(10 / WORLD_SIZE),
					sourceWaterVelocity: new GLOW.Float(0.1 / WORLD_SIZE),
					dryDepth: new GLOW.Float(DRY_DEPTH / WORLD_SIZE),
					...uniforms,
				},
				indices: GLOW.Geometry.Plane.indices(),
			});

		this.steps = [
			makeStep(advectStepShader, {}),
			makeStep(outflowScaleShader, {}),
			makeStep(updateHeightStepShader, {
				outflowScales: this.outflowScales,
				drainageAmount: new GLOW.Float(0),
				minFluxArea: new GLOW.Float(MIN_FLUX_AREA / WORLD_SIZE),
			}),
			makeStep(updateVelocityStepShader, {
				frictionMap: new GLOW.Texture({
					data: new Float32Array([1, 0, 0, 0]),
					width: 1,
					height: 1,
					internalFormat: gl.RGBA32F,
					type: gl.FLOAT,
					magFilter: gl.NEAREST,
					minFilter: gl.NEAREST,
				}),
				manningCoefficient: new GLOW.Float(
					MANNING_COEFFICIENT * Math.cbrt(WORLD_SIZE),
				),
				gravity: new GLOW.Float(GRAVITY / WORLD_SIZE),
			}),
		];

		this.state = new FlipFlopFBO({
			width: W,
			height: H,
			internalFormat: gl.RGBA32F,
			type: gl.FLOAT,
			magFilter: gl.LINEAR,
			minFilter: gl.LINEAR,
			depth: false,
			data: new Float32Array(W * H * 4),
		});

		// needed because we manually set the state texture
		context.cache.active = false;
	}

	step(sim: SimState) {
		this.setState(sim);
		for (const [i, step] of this.steps.entries()) {
			if (i == 1) {
				this.outflowScales.bind();
				step.uniforms.texture.data = this.state.texture;
				step.draw();
				this.outflowScales.unbind();
				continue;
			}
			this.state.target.bind();
			step.uniforms.texture.data = this.state.texture;
			step.draw();
			this.state.target.unbind();
			this.state.flip();
		}
		this.getState(sim);
	}

	private setState(sim: SimState) {
		const { gl } = this;
		gl.bindTexture(gl.TEXTURE_2D, this.state.texture.texture);
		gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, W, H, gl.RGBA, gl.FLOAT, sim);
	}

	private getState(sim: SimState) {
		const { gl } = this;
		this.state.texture.bind();
		gl.readPixels(0, 0, W, H, gl.RGBA, gl.FLOAT, sim);
		this.state.texture.unbind();
	}
}

let engine: FloodEngine;

export function init(): SimState {
	engine = new FloodEngine();
	return London(0, W, H, WORLD_SIZE);
	//return DamDry(0, W, H, WORLD_SIZE);
}

export function step(sim: SimState) {
	engine.step(sim);
}
