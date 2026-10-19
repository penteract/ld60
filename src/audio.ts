export const audio = {
	audioContext: new AudioContext(),
    initialised: false,
    oscillators: [] as OscillatorNode[], // shoot me if this is terrible
    gainNodes: [] as GainNode[],
    initialise() {
        if(this.initialised) return;

        let oscillator = audio.audioContext.createOscillator();
        let gainNode = audio.audioContext.createGain();

        gainNode.gain.value=0.2;
        gainNode.connect(audio.audioContext.destination);

        oscillator = this.audioContext.createOscillator();
        oscillator.type = "sine";
        oscillator.connect(gainNode);

        this.oscillators.push(oscillator);
        this.gainNodes.push(gainNode);
        oscillator.start();

        this.initialised = true;
    },

    // takes the height of the water and compares it to the height being placed at
	playNote(waterHeight: number) {
        if (!this.initialised || this.oscillators[0] === undefined || this.gainNodes[0] === undefined ){
            this.initialise();
        }
        this.gainNodes[0].gain.value = 0.02;
        this.oscillators[0].frequency.value = this.getNoiseNote(waterHeight < 0.01);
	},

    getNoiseNote(high: boolean) {
        const octaves = 0.3;
        const noise = Math.pow(2, (2* octaves *(Math.random()-0.5)));
        return (high ? 350 : 150) * noise;
    },
    stop(){
        if (this.initialised){
            this.gainNodes[0].gain.value = 0.0;
        }
    }
};
