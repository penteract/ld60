
export const audio = {
    audioContext: new AudioContext(),

    playNote(){

        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0.01;
        gainNode.connect(this.audioContext.destination);
        

        const oscillator = this.audioContext.createOscillator();
        oscillator.type = "sawtooth";
        oscillator.frequency.value = this.getNoiseNote();

        oscillator.connect(gainNode);
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.1);
    },

    getNoiseNote(){
        const randValue = Math.round((Math.random() * 12) - 6);
        return 110 * Math.pow(2, randValue/12);
    }
}
