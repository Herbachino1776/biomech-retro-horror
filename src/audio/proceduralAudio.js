const SAMPLE_RATE = 22050;

function clampSample(value) {
  return Math.max(-1, Math.min(1, value));
}

function toBase64(binary) {
  if (typeof btoa === 'function') {
    return btoa(binary);
  }

  return Buffer.from(binary, 'binary').toString('base64');
}

function createWaveDataUri({ durationMs, sampleRate = SAMPLE_RATE, generator }) {
  const sampleCount = Math.max(1, Math.floor(sampleRate * (durationMs / 1000)));
  const pcm = new Int16Array(sampleCount);

  for (let index = 0; index < sampleCount; index += 1) {
    const time = index / sampleRate;
    pcm[index] = Math.round(clampSample(generator(time, index, sampleCount)) * 32767);
  }

  const dataSize = pcm.length * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeAscii = (offset, text) => {
    for (let i = 0; i < text.length; i += 1) {
      view.setUint8(offset + i, text.charCodeAt(i));
    }
  };

  writeAscii(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(8, 'WAVE');
  writeAscii(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeAscii(36, 'data');
  view.setUint32(40, dataSize, true);

  for (let i = 0; i < pcm.length; i += 1) {
    view.setInt16(44 + i * 2, pcm[i], true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.subarray(offset, offset + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return `data:audio/wav;base64,${toBase64(binary)}`;
}

function createImpactTexture({ durationMs, baseFreq, endFreq, noiseAmount, harmonics, decayPower = 1.8, wobble = 0 }) {
  return createWaveDataUri({
    durationMs,
    generator: (time, index, sampleCount) => {
      const progress = index / sampleCount;
      const envelope = Math.pow(1 - progress, decayPower);
      const sweepFreq = baseFreq + (endFreq - baseFreq) * progress;
      const wobbleOffset = wobble === 0 ? 0 : Math.sin(time * 35) * wobble;
      const tonal = harmonics.reduce((sum, harmonic) => {
        const partialFreq = sweepFreq * harmonic.multiplier + wobbleOffset;
        return sum + Math.sin(time * Math.PI * 2 * partialFreq + harmonic.phase) * harmonic.gain;
      }, 0);
      const grit = (Math.sin(time * 7100) * 0.5 + Math.sin(time * 4200 + 1.4) * 0.35 + Math.sin(time * 1700 + 0.3) * 0.15)
        * noiseAmount
        * envelope;
      return (tonal * 0.72 + grit) * envelope;
    }
  });
}

function createStep({ pitch = 1, decayPower = 2.1 }) {
  return createImpactTexture({
    durationMs: 92,
    baseFreq: 84 * pitch,
    endFreq: 48 * pitch,
    noiseAmount: 0.52,
    decayPower,
    wobble: 1.6,
    harmonics: [
      { multiplier: 1, gain: 0.85, phase: 0 },
      { multiplier: 2.1, gain: 0.18, phase: 0.8 }
    ]
  });
}

function createAttack({ pitch = 1, decayPower = 1.7, durationMs = 156 }) {
  return createImpactTexture({
    durationMs,
    baseFreq: 136 * pitch,
    endFreq: 72 * pitch,
    noiseAmount: 0.42,
    decayPower,
    wobble: 2.8,
    harmonics: [
      { multiplier: 1, gain: 0.7, phase: 0.2 },
      { multiplier: 1.8, gain: 0.26, phase: 0.5 },
      { multiplier: 3.2, gain: 0.12, phase: 1.1 }
    ]
  });
}

function createHurt({ pitch = 1, durationMs = 220, decayPower = 1.45 }) {
  return createImpactTexture({
    durationMs,
    baseFreq: 178 * pitch,
    endFreq: 66 * pitch,
    noiseAmount: 0.62,
    decayPower,
    wobble: 5.5,
    harmonics: [
      { multiplier: 1, gain: 0.62, phase: 0 },
      { multiplier: 1.47, gain: 0.24, phase: 1.7 },
      { multiplier: 2.3, gain: 0.14, phase: 0.9 }
    ]
  });
}

function createDeath({ pitch = 1, durationMs = 420, decayPower = 1.18 }) {
  return createImpactTexture({
    durationMs,
    baseFreq: 122 * pitch,
    endFreq: 34 * pitch,
    noiseAmount: 0.68,
    decayPower,
    wobble: 8.5,
    harmonics: [
      { multiplier: 1, gain: 0.74, phase: 0 },
      { multiplier: 1.32, gain: 0.22, phase: 1.2 },
      { multiplier: 2.1, gain: 0.12, phase: 0.4 }
    ]
  });
}

export const PROCEDURAL_AUDIO_URLS = {
  playerFootstepA: createStep({ pitch: 0.96, decayPower: 2.2 }),
  playerFootstepB: createStep({ pitch: 0.88, decayPower: 2.35 }),
  playerAttack: createAttack({ pitch: 1.06, durationMs: 138 }),
  playerHit: createAttack({ pitch: 1.18, durationMs: 124, decayPower: 1.55 }),
  playerHurt: createHurt({ pitch: 1.1, durationMs: 210 }),
  playerDeath: createDeath({ pitch: 0.92, durationMs: 460 }),
  enemyAttack: createAttack({ pitch: 0.92, durationMs: 164 }),
  enemyHurt: createHurt({ pitch: 0.9, durationMs: 196 }),
  enemyDeath: createDeath({ pitch: 0.84, durationMs: 360 }),
  tollKeeperAttack: createAttack({ pitch: 0.72, durationMs: 212, decayPower: 1.52 }),
  tollKeeperHurt: createHurt({ pitch: 0.76, durationMs: 248, decayPower: 1.38 }),
  tollKeeperDeath: createDeath({ pitch: 0.64, durationMs: 520, decayPower: 1.08 }),
  minibossAttack: createAttack({ pitch: 0.58, durationMs: 280, decayPower: 1.36 }),
  minibossHurt: createHurt({ pitch: 0.64, durationMs: 300, decayPower: 1.28 }),
  minibossDeath: createDeath({ pitch: 0.52, durationMs: 760, decayPower: 1.02 })
};
