export const audio = {
	audioContext: new AudioContext(),

	playNote() {
		const gainNode = this.audioContext.createGain();
		gainNode.gain.value = 0.02;
		gainNode.connect(this.audioContext.destination);

		const oscillator = this.audioContext.createOscillator();
		oscillator.type = "sine";
		oscillator.frequency.value = this.getNoiseNote();

		oscillator.connect(gainNode);
		oscillator.start();
		oscillator.stop(this.audioContext.currentTime + 0.03);
	},

	getNoiseNote() {
		const randValue = Math.random() * 18 - 9;
		return 150 * Math.pow(2, randValue / 12);
	},
};
