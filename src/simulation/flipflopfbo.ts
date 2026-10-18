import { GLOW } from "./glow";

// two FBOs to ping-pong between, since a shader can't sample the texture it's
// rendering into; modeled on WebFlood's flipFlopFBO
export class FlipFlopFBO {
	fbo1: any;
	fbo2: any;
	// the FBO to sample from in the next draw
	texture: any;
	// the FBO to render into in the next draw
	target: any;

	constructor(options: Record<string, any>) {
		this.fbo1 = new GLOW.FBO(options);
		// only fbo1 holds initial data; fbo2 just needs allocating
		this.fbo2 = new GLOW.FBO({ ...options, data: null });
		this.texture = this.fbo1;
		this.target = this.fbo2;
	}

	flip() {
		const oldTexture = this.texture;
		this.texture = this.target;
		this.target = oldTexture;
	}
}
