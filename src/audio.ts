import type { SimState } from "./simstate";

export const audio = {
	audioContext: new AudioContext(),
	initialised: false,
	gainNodes: [] as GainNode[],
	audioBuffer: [] as AudioBufferSourceNode[],
	noiseFilter: [] as BiquadFilterNode[],
	initialise() {
		if (this.initialised) return;

		const gainNode = this.audioContext.createGain();
		gainNode.gain.value = 0.2;

		// create a noise buffer for placing land (taken from Mozilla's tutorial on noise buffer)
		const sampleCount = this.audioContext.sampleRate * 2; // 2 seconds
		const buffer = this.audioContext.createBuffer(
			1,
			sampleCount,
			this.audioContext.sampleRate,
		);
		const samples = buffer.getChannelData(0);

		for (let i = 0; i < sampleCount; i++) {
			samples[i] = Math.random() * 2 - 1;
		}

		const noise = this.audioContext.createBufferSource();
		noise.buffer = buffer;
		noise.loop = true;

		const filter = this.audioContext.createBiquadFilter();
		filter.type = "lowpass";
		filter.frequency.value = 350; // raise this to make the noise brighter

		//connect the nodes in series
		noise.connect(filter);
		filter.connect(gainNode);
		gainNode.connect(this.audioContext.destination);

		noise.start();

		this.gainNodes.push(gainNode);
		this.audioBuffer.push(noise);
		this.noiseFilter.push(filter);

		// get sample for water waves audio that i recorded from the beach
		this.setupSample().then((sample) => {
			const sampleSrc = new AudioBufferSourceNode(this.audioContext, {
				buffer: sample,
			});

			// make a Second gain node for this loop; make it silent initially
			// (its volume will scale with water speed)
			const waveGain = this.audioContext.createGain();
			waveGain.gain.value = 0.0;

			sampleSrc.connect(waveGain);
			waveGain.connect(this.audioContext.destination);
			sampleSrc.loop = true;
			sampleSrc.loopStart = 0.5;
			sampleSrc.loopEnd = sample.length - 0.5; // trim the empty space before and after
			sampleSrc.start();

			this.gainNodes.push(waveGain);
			this.audioBuffer.push(sampleSrc);
		});

		this.initialised = true;
	},

	update(sim: SimState, frame: number) {
		// generic in case we want to add any more to it
		if (frame % 10 === 0) {
			// cut some processor load
			this.updateWaveGain(sim);
		}
	},

	// takes the height of the water and compares it to the height being placed at
	playNote(waterHeight: number) {
		// sanity
		if (
			!this.initialised ||
			this.gainNodes.length === 0 ||
			this.audioBuffer.length === 0
		) {
			this.initialise();
		}

		this.gainNodes[0].gain.value = 0.2;

		// placing on/above water: play a high pitch; placing below water: play a lower "submerged" pitch
		// lerp between two submerged values to add a bit of naturality
		let base =
			waterHeight < 0.01
				? 1000
				: waterHeight > 0.02 || isNaN(waterHeight)
					? 200
					: 1800 - 80000 * waterHeight;
		this.noiseFilter[0].frequency.value = this.getNoiseNote(base);
	},

	getNoiseNote(base: number) {
		const octaves = 0.3;
		const noise = Math.pow(2, 2 * octaves * (Math.random() - 0.5));
		return base * noise;
	},

	stop() {
		if (this.initialised && this.gainNodes.length > 0) {
			this.gainNodes[0].gain.value = 0.0;
		}
	},

	updateWaveGain(sim: SimState) {
		if (!this.initialised || this.gainNodes.length < 2) return;

		let maxSqSpd = 0;
		for (let i = 0; i < sim.width; ++i) {
			for (let j = 0; j < sim.height; ++j) {
				maxSqSpd = Math.max(
					maxSqSpd,
					sim.getVx(i, j) ** 2 + sim.getVy(i, j) ** 2,
				);
			}
		}

		this.gainNodes[1].gain.value = sim.paused ? 0.0 : maxSqSpd * 10;
	},

	async getFile(audioContext: AudioContext, filepath: string) {
		const response = await fetch(filepath);
		const arrayBuffer = await response.arrayBuffer();
		const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
		return audioBuffer;
	},

	async setupSample() {
		const filePath = "./src/assets/oceanwaves.m4a";
		const sample = await this.getFile(this.audioContext, filePath);
		return sample;
	},
};
