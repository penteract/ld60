import simulationVertexShader from "./vertex.glsl?raw";
import simulationPrefixShader from "./prefix.glsl?raw";
import outflowScaleShader from "./outflow-scale.glsl?raw";
import advectStepShader from "./steps/advect-height-velocity.glsl?raw";
import updateHeightStepShader from "./steps/update-height.glsl?raw";
import updateVelocityStepShader from "./steps/update-velocity.glsl?raw";
import calcMetricsShader from "./calc-metrics.glsl?raw";

import { GLOW } from "./glow";
import { FlipFlopFBO } from "./flipflopfbo";
import { SimState } from "../simstate";
import { DamDry, DamWet, Guy, type Map } from "./starts";
import { London } from "./startmap";

// time resolution of the simulation
// currently tied to framerate
const dt = 1 / 120;
const STEPS_PER_FRAME = 2;
// width and height resolution of the simulation
export const W = 256;
export const H = 256;

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
	// each step renders into target, then flips it; inputs maps sampler
	// uniforms to the FlipFlopFBOs they read, rebound before every draw
	private steps: {
		shader: any;
		target: FlipFlopFBO;
		inputs: Record<string, FlipFlopFBO>;
	}[];
	map: Map;
	private speed;
	private sourceHeight;
	private sourceVelocity;
	private stateTexture: FlipFlopFBO;
	// per-cell outflow limiter, written by the outflow-scale step and read by
	// update-height
	private outflowScales: FlipFlopFBO;
	// per-cell running max of velocity and depth
	private metrics: FlipFlopFBO;

	private elapsed: number;

	constructor(map: Map) {
		this.map = map;
		this.speed = this.map.speed ?? 1;
		this.sourceHeight =
			this.map.sourceHeight ??
			((_) => (9.5 + Math.random()) / this.map.worldSize);
		this.sourceVelocity =
			this.map.sourceVelocity ??
			this.map.sourceVelocity ??
			((_) => 0.1 / this.map.worldSize);
		this.elapsed = 0;
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

		this.outflowScales = new FlipFlopFBO({
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

		this.metrics = new FlipFlopFBO({
			width: W,
			height: H,
			internalFormat: gl.RGBA32F,
			type: gl.FLOAT,
			magFilter: gl.NEAREST,
			minFilter: gl.NEAREST,
			depth: false,
			data: new Float32Array(W * H * 4),
		});

		const makeStep = (
			target: FlipFlopFBO,
			stepShader: string,
			uniforms: Record<string, any>,
			inputs: Record<string, FlipFlopFBO> = {},
		) => ({
			target,
			// every step reads the state as `texture`
			inputs: { texture: this.stateTexture, ...inputs },
			shader: new GLOW.Shader({
				vertexShader: simulationVertexShader,
				fragmentShader: simulationPrefixShader + "\n" + stepShader,
				data: {
					texture: undefined,
					...Object.fromEntries(Object.keys(inputs).map((k) => [k, undefined])),
					vertices: GLOW.Geometry.Plane.vertices(),
					uvs: GLOW.Geometry.Plane.uvs(),
					unit: new GLOW.Float(1 / W),
					dt: new GLOW.Float(dt),
					dryDepth: new GLOW.Float(DRY_DEPTH / this.map.worldSize),
					...uniforms,
				},
				indices: GLOW.Geometry.Plane.indices(),
			}),
		});

		this.stateTexture = new FlipFlopFBO({
			width: W,
			height: H,
			internalFormat: gl.RGBA32F,
			type: gl.FLOAT,
			magFilter: gl.LINEAR,
			minFilter: gl.LINEAR,
			depth: false,
			data: new Float32Array(W * H * 4),
		});

		this.steps = [
			makeStep(this.stateTexture, advectStepShader, {}),
			makeStep(this.outflowScales, outflowScaleShader, {}),
			makeStep(
				this.stateTexture,
				updateHeightStepShader,
				{
					drainageAmount: new GLOW.Float(0),
					minFluxArea: new GLOW.Float(MIN_FLUX_AREA / this.map.worldSize),
				},
				{ outflowScales: this.outflowScales },
			),
			makeStep(this.stateTexture, updateVelocityStepShader, {
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
					MANNING_COEFFICIENT * Math.cbrt(this.map.worldSize),
				),
				gravity: new GLOW.Float(GRAVITY / this.map.worldSize),
			}),
			makeStep(this.metrics, calcMetricsShader, {}, { metrics: this.metrics }),
		];

		// needed because we manually set the state texture
		context.cache.active = false;
	}

	step(sim: SimState) {
		this.setState(sim);
		for (let substep = 0; substep < STEPS_PER_FRAME * this.speed; substep++) {
			for (const { shader, target, inputs } of this.steps) {
				for (const [name, input] of Object.entries(inputs))
					shader.uniforms[name].data = input.texture;

				// source water height and velocity
				shader.uniforms["sourceWaterHeight"].data = new GLOW.Float(
					this.sourceHeight(this.elapsed),
				);
				shader.uniforms["sourceWaterVelocity"].data = new GLOW.Float(
					this.sourceVelocity(this.elapsed),
				);

				target.target.bind();
				shader.draw();
				target.target.unbind();
				target.flip();
			}
			this.elapsed += dt;
		}
		this.getState(sim);
	}

	private setState(sim: SimState) {
		const { gl } = this;
		gl.bindTexture(gl.TEXTURE_2D, this.stateTexture.texture.texture);
		gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, W, H, gl.RGBA, gl.FLOAT, sim);
	}

	getMetrics(out: Float32Array = new Float32Array(W * H * 4)): Float32Array {
		const { gl } = this;
		this.metrics.texture.bind();
		gl.readPixels(0, 0, W, H, gl.RGBA, gl.FLOAT, out);
		this.metrics.texture.unbind();
		return out.map((x) => x * this.map.worldSize);
	}

	private getState(sim: SimState) {
		const { gl } = this;
		this.stateTexture.texture.bind();
		gl.readPixels(0, 0, W, H, gl.RGBA, gl.FLOAT, sim);
		this.stateTexture.texture.unbind();
	}
}

let engine: FloodEngine;

export function init(mapName: string): SimState {
	let map: Map;
	switch (mapName) {
		case "london":
			map = London(0, W, H);
			break;
		case "dam":
			map = DamDry(0, W, H);
			break;
		case "damwet":
			map = DamWet(0, W, H);
			break;
		case "guy":
			map = Guy(W, H);
			break;
		default:
			throw "you suck";
	}

	engine = new FloodEngine(map);
	return engine.map.initState;
}

// width of the current map, in m
export function worldSize(): number {
	return engine.map.worldSize;
}

export function step(sim: SimState) {
	engine.step(sim);
}

// get metrics, in SI units
export function getMetrics(out?: Float32Array): Float32Array {
	return engine.getMetrics(out);
}
