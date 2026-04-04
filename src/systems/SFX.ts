// Procedural sound effects — pure TypeScript, Web Audio API only (no Phaser dependency)
// AudioContext created lazily on first sound trigger (not on import) for Node test compatibility

let ctx: AudioContext | null = null;
let muted = false;

function getContext(): AudioContext | null {
  if (typeof AudioContext === 'undefined') return null;
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  freqEnd?: number,
  volume = 0.3,
): void {
  if (muted) return;
  const ac = getContext();
  if (!ac) return;

  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime);
  if (freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(freqEnd, ac.currentTime + duration);
  }
  gain.gain.setValueAtTime(volume, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + duration);
}

function playNoise(duration: number, volume = 0.15): void {
  if (muted) return;
  const ac = getContext();
  if (!ac) return;

  const bufferSize = Math.floor(ac.sampleRate * duration);
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = ac.createBufferSource();
  source.buffer = buffer;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(volume, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
  source.connect(gain);
  gain.connect(ac.destination);
  source.start();
}

/** Defender placement — bright pop */
export function playSfxPlace(): void {
  playTone(600, 0.1, 'sine', 900, 0.25);
}

/** Water Pistol fire — squirt sound */
export function playSfxFire(): void {
  playTone(800, 0.15, 'sawtooth', 400, 0.15);
  playNoise(0.08, 0.1);
}

/** Projectile impact — thud */
export function playSfxHit(): void {
  playTone(200, 0.1, 'square', 80, 0.2);
}

/** Enemy death — poof (different pitch per type) */
export function playSfxDeath(enemyKey: string): void {
  const baseFreq = enemyKey === 'basic' ? 300 : 150;
  playNoise(0.2, 0.2);
  playTone(baseFreq, 0.15, 'sine', baseFreq * 0.3, 0.15);
}

/** Spark collection — ascending chime */
export function playSfxCollect(): void {
  playTone(800, 0.08, 'sine', 1200, 0.2);
  setTimeout(() => playTone(1200, 0.1, 'sine', 1600, 0.15), 50);
}

/** Debris cleanup tap — pop/sweep */
export function playSfxClean(): void {
  playTone(500, 0.08, 'sine', 1000, 0.2);
  playNoise(0.06, 0.08);
}

/** Wave announcement — alert stinger */
export function playSfxAnnounce(): void {
  playTone(440, 0.1, 'square', 660, 0.2);
  setTimeout(() => playTone(660, 0.15, 'square', 880, 0.2), 100);
}

/** Set mute state */
export function setSfxMuted(value: boolean): void {
  muted = value;
}

/** Get mute state */
export function isSfxMuted(): boolean {
  return muted;
}
