import { SFX } from "../assets/sfx.js";

export class AudioManager {
  constructor() {
    this.context = null;
    this.master = null;
    this.enabled = true;
  }

  ensureContext() {
    if (!this.enabled) {
      return null;
    }

    if (!this.context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        this.enabled = false;
        return null;
      }

      this.context = new AudioContextClass();
      this.master = this.context.createGain();
      this.master.gain.value = 0.65;
      this.master.connect(this.context.destination);
    }

    if (this.context.state === "suspended") {
      this.context.resume().catch(() => {});
    }

    return this.context;
  }

  play(name) {
    const preset = SFX[name];
    const context = this.ensureContext();
    if (!preset || !context || !this.master) {
      return;
    }

    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();

    oscillator.type = preset.type;
    oscillator.frequency.setValueAtTime(preset.frequency, now);
    if (preset.sweep) {
      oscillator.frequency.linearRampToValueAtTime(preset.frequency + preset.sweep, now + preset.duration);
    }

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1800, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(preset.volume, now + preset.attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + preset.decay);

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);

    oscillator.start(now);
    oscillator.stop(now + preset.duration);

    if (preset.noise) {
      const buffer = context.createBuffer(1, context.sampleRate * preset.duration, context.sampleRate);
      const channel = buffer.getChannelData(0);
      for (let index = 0; index < channel.length; index += 1) {
        channel[index] = (Math.random() * 2 - 1) * preset.noise;
      }

      const source = context.createBufferSource();
      const noiseGain = context.createGain();
      source.buffer = buffer;
      noiseGain.gain.setValueAtTime(preset.volume * 0.6, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + preset.duration);
      source.connect(noiseGain);
      noiseGain.connect(this.master);
      source.start(now);
    }
  }
}
