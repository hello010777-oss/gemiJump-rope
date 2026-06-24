/**
 * Child-friendly synthesis sound engine using Web Audio API.
 * No external static sound files needed, preventing loading failures.
 */

let audioCtx: AudioContext | null = null;
const activeSources = new Set<AudioScheduledSourceNode>();

function getContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function trackSource(source: AudioScheduledSourceNode) {
  activeSources.add(source);
  source.onended = () => {
    activeSources.delete(source);
  };
}

/**
 * Play a cute cartoon pop sound
 */
export function playPop() {
  try {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.08);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    trackSource(osc);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  } catch (error) {
    console.warn('Audio play failed', error);
  }
}

/**
 * Play a cute "Boing" jump sound
 */
export function playBoing() {
  try {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Cute pitch sweep upwards like a cartoon spring
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    trackSource(osc);
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  } catch (e) {
    // browser blocked or un-supported
  }
}

/**
 * Play rope swoosh sound
 */
export function playSwoosh() {
  try {
    const ctx = getContext();
    
    // Create white noise for air cutting sound
    const bufferSize = ctx.sampleRate * 0.15; // 0.15 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;

    // Filter to make it sound like a soft "whoosh" instead of harsh static noise
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    filter.Q.setValueAtTime(2.0, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.15);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    trackSource(noiseNode);
    noiseNode.start();
    noiseNode.stop(ctx.currentTime + 0.15);
  } catch (e) {
    // blocked
  }
}

/**
 * Play successful step fanfare (C major arpeggio)
 */
export function playSuccess() {
  try {
    const ctx = getContext();
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4, E4, G4, C5, E5
    
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);
      
      const startTime = ctx.currentTime + index * 0.08;
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
      
      trackSource(osc);
      osc.start(startTime);
      osc.stop(startTime + 0.45);
    });
  } catch (e) {}
}

/**
 * Play grandiose finish theme
 */
export function playGrandCelebration() {
  try {
    const ctx = getContext();
    const now = ctx.currentTime;
    // Energetic happy progression
    const fanfares = [
      { f: 523.25, t: 0.0 }, // C5
      { f: 587.33, t: 0.1 }, // D5
      { f: 659.25, t: 0.2 }, // E5
      { f: 783.99, t: 0.3 }, // G5
      { f: 523.25, t: 0.4 }, // C5
      { f: 783.99, t: 0.4 }, // G5 (chord)
      { f: 1046.50, t: 0.5 } // C6 (grand highlight)
    ];

    fanfares.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      
      // Make it sound like a bright cartoon trumpet!
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now + note.t);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(note.f, now + note.t);
      gain.gain.setValueAtTime(0.1, now + note.t);
      gain.gain.exponentialRampToValueAtTime(0.01, now + note.t + 0.5);

      trackSource(osc);
      osc.start(now + note.t);
      osc.stop(now + note.t + 0.6);
    });
  } catch (e) {}
}

/**
 * Play a kid rhythmic background track (Tick-tock swing beat)
 */
let beatInterval: any = null;
let currentBpm = 100;

export function startRhythmBeat(bpm: number) {
  stopRhythmBeat();
  currentBpm = bpm;
  const intervalMs = (60 / bpm) * 1000;
  let tick = true;

  beatInterval = setInterval(() => {
    try {
      const ctx = getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      if (tick) {
        // "Tick" - Low bass pulse + high chime for visual rope feedback
        osc.frequency.setValueAtTime(80, ctx.currentTime);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      } else {
        // "Tock"
        osc.frequency.setValueAtTime(110, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
      }

      trackSource(osc);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
      tick = !tick;
    } catch (e) {}
  }, intervalMs);
}

export function stopRhythmBeat() {
  if (beatInterval) {
    clearInterval(beatInterval);
    beatInterval = null;
  }
}

export function stopAllAudio() {
  stopRhythmBeat();
  activeSources.forEach(source => {
    try {
      source.stop();
    } catch (e) {
      // Already stopped or not started yet.
    }
  });
  activeSources.clear();
}
