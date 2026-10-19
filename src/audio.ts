export const audio = {
	audioContext: new AudioContext(),
	initialised: false,
	playing: false,
	height: 0.0,
	// takes the height of the water and compares it to the height being placed at
	playNote(waterHeight: number) {
		const gainNode = this.audioContext.createGain();
		gainNode.gain.value = 0.02;
		gainNode.connect(this.audioContext.destination);

		const oscillator = this.audioContext.createOscillator();
		oscillator.type = "sine";
		oscillator.frequency.value = this.getNoiseNote(waterHeight < 0.01);

		oscillator.connect(gainNode);
		oscillator.start();
		oscillator.stop(this.audioContext.currentTime + 0.03);
	},

	getNoiseNote(high: boolean) {
		const octaves = 0.3;
		const noise = Math.pow(2, 2 * octaves * (Math.random() - 0.5));
		return (high ? 350 : 150) * noise;
	},
};

audio.oscillator = audio.audioContext.createOscillator();
audio.gainNode = audio.audioContext.createGain();
audio.initialise = function () {
	audio.gainNode.gain.value = 0.0;
	audio.gainNode.connect(audio.audioContext.destination);
	audio.oscillator = this.audioContext.createOscillator();
	audio.oscillator.type = "sine";
	OscillatorNode.connect(gainNode);
};

audio.play = function () {
	audio.gainNode.gain.value = 0.02;
};

audio.stop = function () {
	audio.gainNode.gain.value = 0.0;
	audio.playing = false;
};
