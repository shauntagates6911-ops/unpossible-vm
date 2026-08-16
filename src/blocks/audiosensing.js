const Cast = require('../util/cast');

class Scratch3AudioSensing {
    constructor (runtime) {
        this.runtime = runtime;

        // Web Audio API properties
        this._audioContext = null;
        this._analyser = null;
        this._micStream = null;
        this._dataArray = null;
        this._isListening = false;
    }

    getPrimitives () {
        return {
            audiosensing_startListening: this.startListening,
            audiosensing_stopListening: this.stopListening,
            audiosensing_getLoudness: this.getLoudness,
            audiosensing_getPitchFrequency: this.getPitchFrequency
        };
    }

    /**
     * Initialize microphone stream and Web Audio Analyser node
     */
    async startListening () {
        if (this._isListening) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            this._micStream = stream;

            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this._audioContext = new AudioContext();
            
            const source = this._audioContext.createMediaStreamSource(stream);
            this._analyser = this._audioContext.createAnalyser();
            this._analyser.fftSize = 2048;

            source.connect(this._analyser);
            this._dataArray = new Uint8Array(this._analyser.frequencyBinCount);
            this._isListening = true;
        } catch (err) {
            console.error('Audio Sensing permission error or device unavailable:', err);
        }
    }

    /**
     * Stop microphone track and clean up AudioContext
     */
    stopListening () {
        if (!this._isListening) return;

        if (this._micStream) {
            this._micStream.getTracks().forEach(track => track.stop());
            this._micStream = null;
        }
        if (this._audioContext) {
            this._audioContext.close();
            this._audioContext = null;
        }
        this._analyser = null;
        this._isListening = false;
    }

    /**
     * Calculates volume level (0 to 100)
     */
    getLoudness () {
        if (!this._isListening || !this._analyser) return 0;

        this._analyser.getByteFrequencyData(this._dataArray);
        let sum = 0;
        for (let i = 0; i < this._dataArray.length; i++) {
            sum += this._dataArray[i];
        }
        const average = sum / this._dataArray.length;
        // Map average (0 - 255) to range (0 - 100)
        return Math.min(100, Math.round((average / 255) * 100 * 2.5));
    }

    /**
     * Returns dominant frequency peak in Hz
     */
    getPitchFrequency () {
        if (!this._isListening || !this._analyser) return 0;

        this._analyser.getByteFrequencyData(this._dataArray);
        let maxVal = -1;
        let maxIndex = -1;

        for (let i = 0; i < this._dataArray.length; i++) {
            if (this._dataArray[i] > maxVal) {
                maxVal = this._dataArray[i];
                maxIndex = i;
            }
        }

        const nyquist = this._audioContext.sampleRate / 2;
        const frequency = (maxIndex / this._dataArray.length) * nyquist;
        return Math.round(frequency);
    }
}

module.exports = Scratch3AudioSensing;
const Scratch3AudioSensing = require('../blocks/scratch3_audiosensing');

module.exports = [
    // ... standard block packages
    {
        implementation: Scratch3AudioSensing,
        opcodePrefix: 'audiosensing_'
    }
];
