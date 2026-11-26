"use client";

export type StepSurface = "grass" | "path" | "stone" | "wood" | "water" | "arcade";

export type SfxEvent = "mission" | "inscription" | "relic" | "gate" | "door" | "rest" | "found";

type Room = "arcade" | "none";

type ToneOptions = {
  type: OscillatorType;
  from: number;
  to?: number;
  duration: number;
  gain: number;
  pan?: number;
  at?: number;
  filter?: { type: BiquadFilterType; frequency: number; q?: number };
};

type NoiseOptions = {
  duration: number;
  gain: number;
  pan?: number;
  at?: number;
  filter: { type: BiquadFilterType; frequency: number; q?: number };
};

const MASTER_GAIN = 0.55;

export class SafarSfx {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private enabled = true;
  private lastStep = 0;
  private stepCount = 0;
  private room: Room = "none";
  private hum: { oscillator: OscillatorNode; gain: GainNode } | null = null;
  private humFilter: BiquadFilterNode | null = null;
  private hidden = false;
  private readonly handleVisibility = () => {
    this.hidden = document.hidden;
    this.applyGain();
    if (this.hidden) this.stopHum();
    else if (this.room === "arcade") this.startHum();
  };

  async resume() {
    if (this.context) {
      if (this.context.state === "suspended") {
        await this.context.resume().catch(() => {});
      }
      return;
    }

    if (typeof window === "undefined") return;

    const AudioCtor =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioCtor) return;

    this.context = new AudioCtor();
    this.master = this.context.createGain();
    this.master.gain.value = this.enabled && !this.hidden ? MASTER_GAIN : 0.0001;
    this.master.connect(this.context.destination);
    this.noise = this.makeNoise();
    document.addEventListener("visibilitychange", this.handleVisibility);

    if (this.context.state === "suspended") {
      await this.context.resume().catch(() => {});
    }

    if (this.room === "arcade") this.startHum();
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    this.applyGain();

    if (!enabled) this.stopHum();
    else if (this.room === "arcade") this.startHum();
  }

  setRoom(room: Room) {
    if (this.room === room) return;
    this.room = room;

    if (room === "arcade") this.startHum();
    else this.stopHum();
  }

  step(surface: StepSurface) {
    if (!this.ready()) return;

    const now = this.context!.currentTime;

    if (now - this.lastStep < 0.16) return;
    this.lastStep = now;
    this.stepCount += 1;

    const pan = Math.sin(this.stepCount * 1.9) * 0.22;
    const lift = 0.92 + Math.random() * 0.16;

    switch (surface) {
      case "grass":
        this.noiseBurst({
          duration: 0.12,
          gain: 0.1 * lift,
          pan,
          filter: { type: "bandpass", frequency: 960 * lift, q: 0.65 },
        });
        this.noiseBurst({
          duration: 0.08,
          gain: 0.035,
          pan,
          at: 0.015,
          filter: { type: "highpass", frequency: 2700 },
        });
        this.tone({ type: "sine", from: 88, to: 66, duration: 0.07, gain: 0.05, pan });
        break;
      case "path":
        this.noiseBurst({
          duration: 0.08,
          gain: 0.075 * lift,
          pan,
          filter: { type: "lowpass", frequency: 620 },
        });
        this.tone({ type: "sine", from: 74, to: 58, duration: 0.06, gain: 0.07, pan });
        break;
      case "stone":
        this.noiseBurst({
          duration: 0.05,
          gain: 0.055,
          pan,
          filter: { type: "highpass", frequency: 1500 },
        });
        this.tone({ type: "triangle", from: 720, to: 480, duration: 0.03, gain: 0.025, pan });
        this.tone({ type: "sine", from: 110, to: 82, duration: 0.05, gain: 0.05, pan });
        break;
      case "wood":
        this.tone({ type: "triangle", from: 190, to: 138, duration: 0.08, gain: 0.05, pan });
        this.noiseBurst({
          duration: 0.07,
          gain: 0.04,
          pan,
          filter: { type: "lowpass", frequency: 420 },
        });
        break;
      case "water":
        this.noiseBurst({
          duration: 0.16,
          gain: 0.09,
          pan,
          filter: { type: "highpass", frequency: 820 },
        });
        this.tone({ type: "sine", from: 330, to: 120, duration: 0.14, gain: 0.045, pan });
        break;
      case "arcade":
        this.tone({ type: "square", from: 1380, to: 920, duration: 0.025, gain: 0.014, pan });
        this.noiseBurst({
          duration: 0.04,
          gain: 0.03,
          pan,
          filter: { type: "bandpass", frequency: 2900, q: 1.4 },
        });
        break;
    }
  }

  play(event: SfxEvent) {
    if (!this.ready()) return;

    switch (event) {
      case "mission":
        this.tone({ type: "sine", from: 220, to: 196, duration: 0.7, gain: 0.045 });
        this.tone({ type: "triangle", from: 440, duration: 0.5, gain: 0.025, at: 0.06 });
        this.tone({ type: "triangle", from: 660, duration: 0.55, gain: 0.018, at: 0.12 });
        break;
      case "inscription":
        this.noiseBurst({
          duration: 0.05,
          gain: 0.05,
          filter: { type: "highpass", frequency: 1700 },
        });
        this.tone({ type: "sine", from: 523, duration: 0.34, gain: 0.035, at: 0.02 });
        this.tone({ type: "sine", from: 784, duration: 0.4, gain: 0.025, at: 0.08 });
        break;
      case "relic":
        this.tone({ type: "triangle", from: 392, duration: 0.24, gain: 0.03 });
        this.tone({ type: "triangle", from: 587, duration: 0.32, gain: 0.022, at: 0.07 });
        break;
      case "gate":
        this.noiseBurst({
          duration: 0.45,
          gain: 0.09,
          filter: { type: "bandpass", frequency: 500, q: 1.1 },
        });
        this.noiseBurst({
          duration: 0.55,
          gain: 0.05,
          filter: { type: "bandpass", frequency: 1800, q: 0.8 },
        });
        this.tone({ type: "sine", from: 70, to: 44, duration: 0.6, gain: 0.09 });
        this.tone({ type: "square", from: 1568, duration: 0.05, gain: 0.022, at: 0.12 });
        this.tone({ type: "square", from: 2093, duration: 0.09, gain: 0.02, at: 0.19 });
        break;
      case "door":
        this.tone({
          type: "sawtooth",
          from: 118,
          to: 86,
          duration: 0.26,
          gain: 0.025,
          filter: { type: "lowpass", frequency: 640 },
        });
        this.noiseBurst({
          duration: 0.12,
          gain: 0.04,
          filter: { type: "lowpass", frequency: 500 },
        });
        break;
      case "rest":
        this.noiseBurst({
          duration: 0.5,
          gain: 0.055,
          filter: { type: "highpass", frequency: 700 },
        });
        this.tone({ type: "sine", from: 196, to: 147, duration: 0.4, gain: 0.03 });
        break;
      case "found":
        this.tone({ type: "triangle", from: 880, duration: 0.16, gain: 0.025 });
        this.tone({ type: "triangle", from: 1174, duration: 0.18, gain: 0.022, at: 0.06 });
        this.tone({ type: "triangle", from: 1568, duration: 0.22, gain: 0.018, at: 0.12 });
        break;
    }
  }

  coin() {
    if (!this.ready()) return;
    this.tone({ type: "square", from: 987, duration: 0.055, gain: 0.018 });
    this.tone({ type: "square", from: 1318, duration: 0.1, gain: 0.015, at: 0.055 });
  }

  birds() {
    if (!this.ready()) return;
    const chirps = 2 + Math.floor(Math.random() * 3);
    const pan = Math.random() * 0.7 - 0.35;

    for (let index = 0; index < chirps; index += 1) {
      const base = 2200 + Math.random() * 900;
      this.tone({
        type: "sine",
        from: base,
        to: base + 500 + Math.random() * 700,
        duration: 0.07,
        gain: 0.012,
        pan,
        at: index * 0.12 + Math.random() * 0.05,
      });
    }
  }

  crickets() {
    if (!this.ready()) return;
    const pan = Math.random() * 0.5 - 0.25;

    for (let index = 0; index < 4; index += 1) {
      this.tone({
        type: "sine",
        from: 4200 + Math.random() * 280,
        duration: 0.035,
        gain: 0.006,
        pan,
        at: index * 0.09,
      });
    }
  }

  arcadeBuzz() {
    if (!this.ready()) return;
    this.tone({
      type: "sawtooth",
      from: 118,
      to: 112,
      duration: 0.09,
      gain: 0.006,
      filter: { type: "lowpass", frequency: 400 },
    });
    this.tone({
      type: "square",
      from: 2400,
      duration: 0.02,
      gain: 0.005,
      at: 0.05,
    });
  }

  dispose() {
    document.removeEventListener("visibilitychange", this.handleVisibility);
    this.stopHum();
    const context = this.context;
    this.context = null;
    this.master = null;
    this.noise = null;
    void context?.close().catch(() => {});
  }

  private ready() {
    return Boolean(this.enabled && this.context && this.master && !this.hidden && !document.hidden);
  }

  private applyGain() {
    if (!this.context || !this.master) return;
    const target = this.enabled && !this.hidden ? MASTER_GAIN : 0.0001;
    this.master.gain.setTargetAtTime(target, this.context.currentTime, 0.03);
  }

  private makeNoise() {
    const context = this.context!;
    const buffer = context.createBuffer(
      1,
      Math.floor(context.sampleRate * 1.4),
      context.sampleRate,
    );
    const data = buffer.getChannelData(0);
    let last = 0;

    for (let index = 0; index < data.length; index += 1) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[index] = last * 3.2;
    }

    return buffer;
  }

  private tone(options: ToneOptions) {
    const context = this.context;
    const master = this.master;
    if (!context || !master) return;

    const start = context.currentTime + (options.at ?? 0);
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const panner = context.createStereoPanner();
    const filter = options.filter ? context.createBiquadFilter() : null;

    oscillator.type = options.type;
    oscillator.frequency.setValueAtTime(Math.max(20, options.from), start);

    if (options.to && options.to !== options.from) {
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(20, options.to),
        start + options.duration,
      );
    }

    if (filter) {
      filter.type = options.filter!.type;
      filter.frequency.setValueAtTime(options.filter!.frequency, start);
      filter.Q.value = options.filter!.q ?? 0.7;
      oscillator.connect(filter);
      filter.connect(gain);
    } else {
      oscillator.connect(gain);
    }

    panner.pan.value = options.pan ?? 0;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0003, options.gain), start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + options.duration);
    gain.connect(panner);
    panner.connect(master);

    oscillator.start(start);
    oscillator.stop(start + options.duration + 0.03);
  }

  private noiseBurst(options: NoiseOptions) {
    const context = this.context;
    const master = this.master;
    const buffer = this.noise;
    if (!context || !master || !buffer) return;

    const start = context.currentTime + (options.at ?? 0);
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    const panner = context.createStereoPanner();
    const offset = Math.random() * Math.max(0.01, buffer.duration - options.duration - 0.05);

    source.buffer = buffer;
    filter.type = options.filter.type;
    filter.frequency.setValueAtTime(options.filter.frequency, start);
    filter.Q.value = options.filter.q ?? 0.8;
    panner.pan.value = options.pan ?? 0;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0003, options.gain), start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + options.duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(panner);
    panner.connect(master);
    source.start(start, offset, options.duration + 0.02);
  }

  private startHum() {
    if (!this.context || !this.master || !this.enabled || this.hidden || document.hidden) return;
    if (this.hum) return;

    const context = this.context;
    const oscillator = context.createOscillator();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();

    oscillator.type = "sawtooth";
    oscillator.frequency.value = 55;
    filter.type = "lowpass";
    filter.frequency.value = 180;
    gain.gain.value = 0.012;
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    oscillator.start();

    this.hum = { oscillator, gain };
    this.humFilter = filter;
  }

  private stopHum() {
    if (!this.hum) return;

    const now = this.context?.currentTime ?? 0;
    const { oscillator, gain } = this.hum;
    gain.gain.setTargetAtTime(0.0001, now, 0.06);
    oscillator.stop(now + 0.2);
    oscillator.disconnect();
    gain.disconnect();
    this.humFilter?.disconnect();
    this.hum = null;
    this.humFilter = null;
  }
}
