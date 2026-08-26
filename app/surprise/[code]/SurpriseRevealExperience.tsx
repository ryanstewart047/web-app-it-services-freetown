'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { RotateCcw, Sparkles } from 'lucide-react';
import { type SurpriseSoundEffect } from '@/lib/surprise-reveal-sounds';

interface SurpriseRevealExperienceProps {
  recipientName: string;
  achievement: string;
  message: string;
  imageUrl: string;
  soundEffect: SurpriseSoundEffect;
}

type RevealPhase = 'locked' | 'loading' | 'celebrating';

const LOADING_DURATION_MS = 4200;
const MINIMUM_CELEBRATION_MS = 15000;
const CONFETTI_TONES = ['#f6c453', '#ffe9a6', '#ffffff', '#d99528', '#f5e7c6'];
const FLARE_ANGLES = [-74, -45, -18, 18, 45, 74, 106, 135, 162, 198, 225, 254];

function playTone(context: AudioContext, output: AudioNode, start: number, frequency: number, duration: number, volume: number, type: OscillatorType = 'sine') {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(output);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.04);
}

function playNoise(context: AudioContext, output: AudioNode, start: number, duration: number, volume: number) {
  const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let index = 0; index < channel.length; index += 1) channel[index] = Math.random() * 2 - 1;

  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(1200, start);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.buffer = buffer;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(output);
  source.start(start);
}

function playApplauseAndCheering(context: AudioContext, startDelay: number = 0, duration: number = 8) {
  const master = context.createGain();
  const start = context.currentTime + startDelay;

  master.gain.setValueAtTime(0.0001, start);
  // Swell up quickly in 0.3s
  master.gain.exponentialRampToValueAtTime(0.38, start + 0.35);
  // Maintain enthusiastic energy for ~6.2 seconds
  master.gain.setValueAtTime(0.38, start + 6.2);
  // Fade out smoothly over the final 1.8 seconds to reach total 8 seconds
  master.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  master.connect(context.destination);

  // 1. DENSE CROWD APPLAUSE NOISE BUFFER (Stereo clapping impulses + crowd energy)
  const sampleRate = context.sampleRate;
  const bufferSize = Math.ceil(sampleRate * duration);
  const crowdBuffer = context.createBuffer(2, bufferSize, sampleRate);
  const left = crowdBuffer.getChannelData(0);
  const right = crowdBuffer.getChannelData(1);

  for (let i = 0; i < bufferSize; i++) {
    const t = i / sampleRate;
    const whiteL = Math.random() * 2 - 1;
    const whiteR = Math.random() * 2 - 1;

    // Organic clapping rhythm pulses (~13Hz to ~18Hz)
    const clapMod1 = Math.pow(Math.max(0, Math.sin(t * 14 * Math.PI + Math.sin(t * 3.7) * 2)), 8) * 2.2;
    const clapMod2 = Math.pow(Math.max(0, Math.sin(t * 17.5 * Math.PI + 1.2)), 6) * 1.8;

    left[i] = whiteL * 0.35 + whiteL * (clapMod1 + clapMod2) * 0.65;
    right[i] = whiteR * 0.35 + whiteR * (clapMod1 + clapMod2) * 0.65;
  }

  // Layer 1: Mid-bandpass for hand claps body (1.2kHz - 2.8kHz)
  const clapSource = context.createBufferSource();
  clapSource.buffer = crowdBuffer;
  const clapFilter = context.createBiquadFilter();
  clapFilter.type = 'bandpass';
  clapFilter.frequency.setValueAtTime(1650, start);
  clapFilter.Q.setValueAtTime(1.4, start);
  const clapGain = context.createGain();
  clapGain.gain.setValueAtTime(0.7, start);
  clapSource.connect(clapFilter);
  clapFilter.connect(clapGain);
  clapGain.connect(master);
  clapSource.start(start);
  clapSource.stop(start + duration + 0.1);

  // Layer 2: Low-mid bandpass for hand slap depth (650Hz - 1100Hz)
  const bodySource = context.createBufferSource();
  bodySource.buffer = crowdBuffer;
  const bodyFilter = context.createBiquadFilter();
  bodyFilter.type = 'bandpass';
  bodyFilter.frequency.setValueAtTime(850, start);
  bodyFilter.Q.setValueAtTime(2.0, start);
  const bodyGain = context.createGain();
  bodyGain.gain.setValueAtTime(0.55, start);
  bodySource.connect(bodyFilter);
  bodyFilter.connect(bodyGain);
  bodyGain.connect(master);
  bodySource.start(start);
  bodySource.stop(start + duration + 0.1);

  // Layer 3: High-frequency snap
  const snapSource = context.createBufferSource();
  snapSource.buffer = crowdBuffer;
  const snapFilter = context.createBiquadFilter();
  snapFilter.type = 'highpass';
  snapFilter.frequency.setValueAtTime(2800, start);
  const snapGain = context.createGain();
  snapGain.gain.setValueAtTime(0.35, start);
  snapSource.connect(snapFilter);
  snapFilter.connect(snapGain);
  snapGain.connect(master);
  snapSource.start(start);
  snapSource.stop(start + duration + 0.1);

  // 2. CHEERING VOICES (Vocal sweeps + formants for "Yeah!", "Whoo-hoo!")
  const cheerFormants = [
    { f1: 650, f2: 1200, gain: 0.26, pitchStart: 380, pitchEnd: 560, delay: 0.1 },
    { f1: 800, f2: 1450, gain: 0.22, pitchStart: 440, pitchEnd: 620, delay: 0.4 },
    { f1: 520, f2: 1050, gain: 0.20, pitchStart: 320, pitchEnd: 480, delay: 1.1 },
    { f1: 750, f2: 1350, gain: 0.24, pitchStart: 500, pitchEnd: 680, delay: 2.2 },
    { f1: 600, f2: 1150, gain: 0.19, pitchStart: 420, pitchEnd: 540, delay: 3.8 },
  ];

  cheerFormants.forEach((cf) => {
    const cheerStart = start + cf.delay;
    const cheerDuration = 2.4;

    const osc = context.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(cf.pitchStart, cheerStart);
    osc.frequency.exponentialRampToValueAtTime(cf.pitchEnd, cheerStart + 0.5);
    osc.frequency.exponentialRampToValueAtTime(cf.pitchStart * 0.9, cheerStart + cheerDuration);

    const f1 = context.createBiquadFilter();
    f1.type = 'bandpass';
    f1.frequency.setValueAtTime(cf.f1, cheerStart);
    f1.Q.setValueAtTime(3.5, cheerStart);

    const f2 = context.createBiquadFilter();
    f2.type = 'bandpass';
    f2.frequency.setValueAtTime(cf.f2, cheerStart);
    f2.Q.setValueAtTime(4.0, cheerStart);

    const vGain = context.createGain();
    vGain.gain.setValueAtTime(0.0001, cheerStart);
    vGain.gain.exponentialRampToValueAtTime(cf.gain, cheerStart + 0.25);
    vGain.gain.exponentialRampToValueAtTime(0.0001, cheerStart + cheerDuration);

    osc.connect(f1);
    f1.connect(f2);
    f2.connect(vGain);
    vGain.connect(master);

    osc.start(cheerStart);
    osc.stop(cheerStart + cheerDuration + 0.05);
  });

  // Layer 4: Discrete foreground individual handclaps
  const clapCount = 36;
  for (let c = 0; c < clapCount; c++) {
    const clapTime = start + 0.15 + (c * (duration - 0.5)) / clapCount + (Math.random() * 0.12 - 0.06);
    if (clapTime > start + duration - 0.2) continue;

    const singleClapDur = 0.024;
    const singleBuf = context.createBuffer(1, Math.ceil(sampleRate * singleClapDur), sampleRate);
    const sData = singleBuf.getChannelData(0);
    for (let k = 0; k < sData.length; k++) {
      sData[k] = (Math.random() * 2 - 1) * Math.exp(-k / (sampleRate * 0.006));
    }

    const sSource = context.createBufferSource();
    sSource.buffer = singleBuf;

    const sFilter = context.createBiquadFilter();
    sFilter.type = 'bandpass';
    sFilter.frequency.setValueAtTime(1400 + Math.random() * 800, clapTime);
    sFilter.Q.setValueAtTime(1.8, clapTime);

    const sGain = context.createGain();
    sGain.gain.setValueAtTime(0.3 + Math.random() * 0.25, clapTime);

    sSource.connect(sFilter);
    sFilter.connect(sGain);
    sGain.connect(master);

    sSource.start(clapTime);
    sSource.stop(clapTime + singleClapDur + 0.01);
  }

  window.setTimeout(() => {
    try {
      master.disconnect();
    } catch {}
  }, (duration + 1) * 1000);
}

function playRevealSound(context: AudioContext, soundEffect: SurpriseSoundEffect) {
  if (soundEffect === 'silent') return;

  const master = context.createGain();
  master.gain.setValueAtTime(0.27, context.currentTime);
  master.connect(context.destination);
  const start = context.currentTime + 0.04;

  if (soundEffect === 'golden-fanfare') {
    [523.25, 659.25, 783.99].forEach((frequency, index) => playTone(context, master, start + index * 0.2, frequency, 0.36, 0.34, 'triangle'));
    [1046.5, 1318.51, 1567.98].forEach((frequency) => playTone(context, master, start + 0.67, frequency, 1.6, 0.2, 'sine'));
  } else if (soundEffect === 'sparkle-cascade') {
    [1046.5, 1318.51, 1567.98, 2093, 2637.02, 3135.96].forEach((frequency, index) => playTone(context, master, start + index * 0.11, frequency, 0.62, 0.16, 'sine'));
    playTone(context, master, start + 0.83, 2093, 1.1, 0.22, 'triangle');
  } else if (soundEffect === 'celebration-drums') {
    [0, 0.32, 0.64].forEach((offset) => {
      playTone(context, master, start + offset, 92, 0.22, 0.48, 'sine');
      playNoise(context, master, start + offset + 0.16, 0.12, 0.16);
    });
    [523.25, 659.25, 783.99].forEach((frequency) => playTone(context, master, start + 0.91, frequency, 1.1, 0.17, 'sawtooth'));
  } else if (soundEffect === 'hand-clap-cheer') {
    playApplauseAndCheering(context, 0.04, 8);
  } else {
    playTone(context, master, start, 261.63, 0.86, 0.2, 'sine');
    playTone(context, master, start + 0.24, 392, 0.92, 0.2, 'triangle');
    playTone(context, master, start + 0.5, 783.99, 1.5, 0.22, 'sine');
  }

  window.setTimeout(() => master.disconnect(), 3200);
}

function getBurstParticles() {
  return Array.from({ length: 72 }, (_, index) => {
    const angle = ((index * 137.5) % 360) * (Math.PI / 180);
    const distance = 180 + ((index * 41) % 310);
    return {
      id: index,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance + 10,
      size: 4 + (index % 4) * 2,
      delay: (index % 9) * 0.06,
      tone: CONFETTI_TONES[index % CONFETTI_TONES.length],
      rotation: (index % 2 ? 1 : -1) * (300 + index * 17),
    };
  });
}

function getFallingConfetti() {
  return Array.from({ length: 54 }, (_, index) => ({
    id: index,
    left: (index * 19.7) % 100,
    size: 5 + (index % 3) * 3,
    delay: 0.4 + (index % 12) * 0.42,
    duration: 5.6 + (index % 6) * 0.46,
    tone: CONFETTI_TONES[(index + 1) % CONFETTI_TONES.length],
    rotation: (index % 2 ? 1 : -1) * (540 + index * 22),
  }));
}

export default function SurpriseRevealExperience({
  recipientName,
  achievement,
  message,
  imageUrl,
  soundEffect,
}: SurpriseRevealExperienceProps) {
  const [phase, setPhase] = useState<RevealPhase>('locked');
  const [progress, setProgress] = useState(0);
  const [run, setRun] = useState(0);
  const [canReplay, setCanReplay] = useState(false);
  const reduceMotion = useReducedMotion();
  const audioContextRef = useRef<AudioContext | null>(null);
  const playedSoundRunRef = useRef<number | null>(null);

  const burstParticles = useMemo(getBurstParticles, []);
  const fallingConfetti = useMemo(getFallingConfetti, []);

  useEffect(() => {
    if (phase !== 'loading') return;

    const startedAt = window.performance.now();
    let frameId = 0;

    const advance = (now: number) => {
      const nextProgress = Math.min(100, Math.round(((now - startedAt) / LOADING_DURATION_MS) * 100));
      setProgress(nextProgress);

      if (nextProgress < 100) {
        frameId = window.requestAnimationFrame(advance);
      } else {
        setPhase('celebrating');
      }
    };

    frameId = window.requestAnimationFrame(advance);
    return () => window.cancelAnimationFrame(frameId);
  }, [phase, run]);

  useEffect(() => {
    if (phase !== 'celebrating' || soundEffect === 'silent' || playedSoundRunRef.current === run) return;
    playedSoundRunRef.current = run;
    const context = audioContextRef.current;
    if (context?.state === 'running') {
      playRevealSound(context, soundEffect);
      // As soon as the image finishes revealing (~1.4s when spring animation lands),
      // play hand clapping with cheering voices that lasts for 8 seconds.
      if (soundEffect !== 'hand-clap-cheer') {
        playApplauseAndCheering(context, 1.4, 8);
      }
    }
  }, [phase, run, soundEffect]);

  useEffect(() => () => {
    void audioContextRef.current?.close();
  }, []);

  useEffect(() => {
    if (phase !== 'celebrating') return;

    const timer = window.setTimeout(() => setCanReplay(true), MINIMUM_CELEBRATION_MS);
    return () => window.clearTimeout(timer);
  }, [phase, run]);

  const beginSurprise = () => {
    if (soundEffect !== 'silent' && !audioContextRef.current) {
      const AudioContextConstructor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextConstructor) audioContextRef.current = new AudioContextConstructor();
    }
    void audioContextRef.current?.resume();
    setProgress(0);
    setCanReplay(false);
    setRun((current) => current + 1);
    setPhase('loading');
  };

  const cinematicDuration = reduceMotion ? 0.01 : 4.8;

  return (
    <main className="relative grid min-h-[100svh] place-items-center overflow-hidden bg-neutral-950 px-4 py-5 text-stone-50 sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-4 border border-amber-200/20 sm:inset-6" />
      <h1 className="sr-only">A recognition surprise for {recipientName}</h1>

      <section className="relative z-10 flex min-h-[min(780px,calc(100svh-40px))] w-full max-w-5xl items-center justify-center text-center sm:min-h-[min(820px,calc(100svh-48px))]" aria-live="polite">
        <AnimatePresence mode="wait">
          {phase === 'locked' && (
            <motion.div
              key="locked"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: reduceMotion ? 0.01 : 0.45 }}
              className="flex flex-col items-center"
            >
              <div className="h-16 w-16 overflow-hidden rounded-md border border-amber-200/70 bg-stone-900 p-1 shadow-[0_0_0_7px_rgba(246,196,83,0.08)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="" className="h-full w-full rounded-[3px] object-cover" />
              </div>
              <motion.button
                type="button"
                onClick={beginSurprise}
                whileHover={reduceMotion ? undefined : { scale: 1.025 }}
                whileTap={{ scale: 0.98 }}
                className="relative mt-10 flex min-h-16 min-w-[min(88vw,360px)] items-center justify-center overflow-hidden rounded-md border border-amber-100 bg-amber-400 px-8 text-lg font-black text-neutral-950 shadow-[0_14px_0_#a15c11,0_26px_60px_rgba(246,196,83,0.28)] focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-200/60"
              >
                <motion.span
                  aria-hidden="true"
                  initial={{ x: '-150%' }}
                  animate={{ x: '170%' }}
                  transition={{ duration: 1.65, repeat: Infinity, repeatDelay: 0.95, ease: 'easeInOut' }}
                  className="pointer-events-none absolute inset-y-[-30%] w-16 -skew-x-12 bg-white/75"
                />
                <span className="relative">Your Surprise</span>
              </motion.button>
            </motion.div>
          )}

          {phase === 'loading' && (
            <motion.div
              key={`loading-${run}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: reduceMotion ? 0.01 : 0.35 }}
              className="w-full max-w-xl"
            >
              <div className="mx-auto h-20 w-20 overflow-hidden rounded-md border border-amber-200/80 bg-stone-900 p-1 shadow-[0_0_0_8px_rgba(246,196,83,0.08)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="" className="h-full w-full rounded-[3px] object-cover" />
              </div>
              <p className="mt-9 text-sm font-black uppercase tracking-normal text-amber-200">Preparing your surprise</p>
              <div className="mt-5 h-5 w-full overflow-hidden rounded-sm border border-amber-100/50 bg-stone-900 p-1 shadow-[0_0_28px_rgba(246,196,83,0.18)]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Surprise loading progress">
                <motion.div className="h-full rounded-[1px] bg-amber-400" animate={{ width: `${progress}%` }} transition={{ duration: 0.1, ease: 'linear' }} />
              </div>
              <p className="mt-4 text-4xl font-black tabular-nums text-stone-50">{progress}%</p>
            </motion.div>
          )}

          {phase === 'celebrating' && (
            <motion.div key={`celebrating-${run}`} className="relative flex w-full max-w-4xl flex-col items-center py-8">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                {FLARE_ANGLES.map((angle, index) => (
                  <div key={`${run}-flare-${angle}`} className="absolute left-1/2 top-[39%] origin-left" style={{ rotate: `${angle}deg` }}>
                    <motion.span
                      className="block h-px w-[min(92vw,790px)] bg-amber-100"
                      initial={{ opacity: 0, scaleX: 0.06 }}
                      animate={{ opacity: [0, 0.75, 0], scaleX: [0.06, 1, 0.12] }}
                      transition={{ duration: reduceMotion ? 0.01 : 3.8, delay: index * 0.06, repeat: 4, repeatDelay: 0.55, ease: 'easeOut' }}
                    />
                  </div>
                ))}
                {burstParticles.map((particle) => (
                  <div key={`${run}-burst-${particle.id}`} className="absolute left-1/2 top-[39%]">
                    <motion.span
                      className="block rounded-[2px]"
                      style={{ width: particle.size, height: particle.size * 2.5, backgroundColor: particle.tone }}
                      initial={{ opacity: 0, x: 0, y: 0, rotate: 0, scale: 0.3 }}
                      animate={{ opacity: [0, 1, 0.94, 0], x: [0, particle.x, particle.x * 0.82], y: [0, particle.y, particle.y + 170], rotate: [0, particle.rotation], scale: [0.3, 1, 0.85] }}
                      transition={{ duration: reduceMotion ? 0.01 : cinematicDuration, delay: particle.delay, repeat: 3, repeatDelay: 0.3, ease: [0.12, 0.72, 0.28, 1] }}
                    />
                  </div>
                ))}
                {fallingConfetti.map((particle) => (
                  <motion.span
                    key={`${run}-fall-${particle.id}`}
                    className="absolute block rounded-[1px]"
                    style={{ left: `${particle.left}%`, top: '-9vh', width: particle.size, height: particle.size * 2.8, backgroundColor: particle.tone }}
                    initial={{ opacity: 0, y: 0, rotate: 0 }}
                    animate={{ opacity: [0, 1, 1, 0], y: ['0vh', '118vh'], rotate: [0, particle.rotation] }}
                    transition={{ duration: reduceMotion ? 0.01 : particle.duration, delay: particle.delay, repeat: Infinity, repeatDelay: 0.2, ease: 'linear' }}
                  />
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.65 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: reduceMotion ? 0.01 : 0.9, delay: reduceMotion ? 0 : 0.76, type: 'spring', stiffness: 125, damping: 14 }}
                className="relative z-10"
              >
                <motion.div aria-hidden="true" className="absolute inset-0 rounded-md border border-amber-100" animate={{ opacity: [0.8, 0, 0.8], scale: [1, 1.72, 2.28] }} transition={{ duration: reduceMotion ? 0.01 : 3.2, repeat: Infinity, ease: 'easeOut' }} />
                <div className="h-48 w-48 overflow-hidden rounded-md border-2 border-amber-200 bg-stone-900 p-1.5 shadow-[0_0_0_10px_rgba(246,196,83,0.09),0_30px_68px_rgba(0,0,0,0.5)] sm:h-60 sm:w-60">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt={recipientName} className="h-full w-full rounded-[3px] object-cover" />
                </div>
              </motion.div>

              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0.01 : 0.6, delay: reduceMotion ? 0 : 1.35 }} className="relative z-10 mt-9 flex items-center gap-2 text-xs font-black uppercase tracking-normal text-amber-200 sm:text-sm"><Sparkles className="h-4 w-4" /> Congratulations <Sparkles className="h-4 w-4" /></motion.p>
              <motion.h2 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0.01 : 0.8, delay: reduceMotion ? 0 : 1.72, ease: [0.16, 1, 0.3, 1] }} className="relative z-10 mt-4 max-w-3xl text-5xl font-black leading-[0.94] text-stone-50 sm:text-7xl">{recipientName}</motion.h2>
              <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0.01 : 0.65, delay: reduceMotion ? 0 : 2.45 }} className="relative z-10 mt-6 max-w-2xl text-xl font-extrabold leading-tight text-amber-200 sm:text-3xl">{achievement}</motion.p>
              {message ? <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0.01 : 0.65, delay: reduceMotion ? 0 : 3.05 }} className="relative z-10 mt-5 max-w-xl text-base leading-7 text-stone-300 sm:text-lg">{message}</motion.p> : null}

              <AnimatePresence>
                {canReplay && (
                  <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} type="button" onClick={beginSurprise} className="relative z-10 mt-10 inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-amber-100/60 px-5 text-sm font-black text-amber-100 transition hover:bg-amber-400 hover:text-neutral-950"><RotateCcw className="h-4 w-4" /> Replay celebration</motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}
