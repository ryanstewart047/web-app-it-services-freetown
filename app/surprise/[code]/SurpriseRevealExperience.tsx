'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Award, CheckCircle2, Download, Eye, HelpCircle, Lock, MessageCircle, RotateCcw, Share2, Sparkles, X } from 'lucide-react';
import { type SurpriseSoundEffect } from '@/lib/surprise-reveal-sounds';
import { type QuizQuestion } from '@/lib/surprise-reveal-storage';
import ProtectedCertificatePreview from '@/components/digital-tools/ProtectedCertificatePreview';

interface SurpriseRevealExperienceProps {
  recipientName: string;
  achievement: string;
  message: string;
  imageUrl: string;
  soundEffect: SurpriseSoundEffect;
  presenterName?: string;
  shareUrl?: string;
  code?: string;
  quiz?: QuizQuestion[];
  isVip?: boolean;
  paymentStatus?: 'pending' | 'approved';
}

type RevealPhase = 'locked' | 'quiz' | 'loading' | 'celebrating';

const LOADING_DURATION_MS = 4200;
const MINIMUM_CELEBRATION_MS = 15000;
const CONFETTI_TONES = ['#f6c453', '#ffe9a6', '#ffffff', '#d99528', '#f5e7c6'];
const FLARE_ANGLES = [-74, -45, -18, 18, 45, 74, 106, 135, 162, 198, 225, 254];

const APPLAUSE_AUDIO_SRC = '/assets/audio/hand-clap-cheering.m4a';

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

function playRevealSound(context: AudioContext, soundEffect: SurpriseSoundEffect) {
  if (soundEffect === 'silent' || soundEffect === 'hand-clap-cheer') return;

  const master = context.createGain();
  master.gain.setValueAtTime(0.25, context.currentTime);
  master.connect(context.destination);
  const start = context.currentTime + 0.04;

  if (soundEffect === 'golden-fanfare') {
    [523.25, 659.25, 783.99].forEach((frequency, index) => playTone(context, master, start + index * 0.2, frequency, 0.34, 0.32, 'triangle'));
    [1046.5, 1318.51, 1567.98].forEach((frequency) => playTone(context, master, start + 0.67, frequency, 1.4, 0.18, 'sine'));
  } else if (soundEffect === 'sparkle-cascade') {
    [1046.5, 1318.51, 1567.98, 2093, 2637.02, 3135.96].forEach((frequency, index) => playTone(context, master, start + index * 0.11, frequency, 0.55, 0.15, 'sine'));
    playTone(context, master, start + 0.83, 2093, 1.0, 0.2, 'triangle');
  } else if (soundEffect === 'celebration-drums') {
    [0, 0.32, 0.64].forEach((offset) => {
      playTone(context, master, start + offset, 92, 0.22, 0.45, 'sine');
    });
    [523.25, 659.25, 783.99].forEach((frequency) => playTone(context, master, start + 0.91, frequency, 1.1, 0.16, 'sawtooth'));
  } else {
    playTone(context, master, start, 261.63, 0.86, 0.2, 'sine');
    playTone(context, master, start + 0.24, 392, 0.92, 0.2, 'triangle');
    playTone(context, master, start + 0.5, 783.99, 1.5, 0.22, 'sine');
  }

  window.setTimeout(() => master.disconnect(), 3200);
}

function playRealApplauseAudio(
  context: AudioContext,
  buffer: AudioBuffer | null,
  startDelay: number = 0,
  duration: number = 8
) {
  if (buffer) {
    try {
      const source = context.createBufferSource();
      source.buffer = buffer;
      const gain = context.createGain();
      const start = context.currentTime + startDelay;

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.9, start + 0.2);
      gain.gain.setValueAtTime(0.9, start + 6.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      source.connect(gain);
      gain.connect(context.destination);

      source.start(start);
      source.stop(start + duration + 0.1);
      return;
    } catch (e) {
      console.warn('[Surprise Audio] WebAudio buffer play error:', e);
    }
  }

  window.setTimeout(() => {
    try {
      const audio = new Audio(APPLAUSE_AUDIO_SRC);
      audio.volume = 0.9;
      audio.currentTime = 0;
      audio.play().catch(() => {});
      window.setTimeout(() => {
        try {
          audio.pause();
        } catch {}
      }, duration * 1000);
    } catch {}
  }, Math.max(0, startDelay * 1000));
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
  presenterName,
  shareUrl,
  code,
  quiz,
  isVip,
  paymentStatus = 'pending',
}: SurpriseRevealExperienceProps) {
  const [phase, setPhase] = useState<RevealPhase>('locked');
  const [progress, setProgress] = useState(0);
  const [run, setRun] = useState(0);
  const [canReplay, setCanReplay] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerWrong, setIsAnswerWrong] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [generatingCert, setGeneratingCert] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'single' | 'monthly' | 'lifetime'>('single');
  const [payMethod, setPayMethod] = useState<'orange_money' | 'afrimoney'>('orange_money');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);

  const isPaymentApproved = paymentStatus === 'approved';

  const reduceMotion = useReducedMotion();
  const audioContextRef = useRef<AudioContext | null>(null);
  const applauseBufferRef = useRef<AudioBuffer | null>(null);
  const playedSoundRunRef = useRef<number | null>(null);

  const burstParticles = useMemo(getBurstParticles, []);
  const fallingConfetti = useMemo(getFallingConfetti, []);
  const validQuiz = useMemo(() => Array.isArray(quiz) && quiz.length > 0 ? quiz : null, [quiz]);

  useEffect(() => {
    let active = true;
    const preloadAudio = async () => {
      try {
        const response = await fetch(APPLAUSE_AUDIO_SRC);
        if (!response.ok) return;
        const arrayBuffer = await response.arrayBuffer();

        const AudioContextClass =
          window.AudioContext ||
          (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;

        const tempContext = audioContextRef.current || new AudioContextClass();
        if (!audioContextRef.current) audioContextRef.current = tempContext;

        tempContext.decodeAudioData(
          arrayBuffer,
          (decoded) => {
            if (active) applauseBufferRef.current = decoded;
          },
          () => {}
        );
      } catch {}
    };

    void preloadAudio();
    return () => {
      active = false;
    };
  }, []);

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

    if (context && context.state === 'suspended') {
      void context.resume();
    }

    if (context) {
      playRevealSound(context, soundEffect);
      const startDelay = soundEffect === 'hand-clap-cheer' ? 0.05 : 1.35;
      playRealApplauseAudio(context, applauseBufferRef.current, startDelay, 8);
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

  const unlockAudioContext = () => {
    if (soundEffect !== 'silent') {
      if (!audioContextRef.current) {
        const AudioContextConstructor =
          window.AudioContext ||
          (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AudioContextConstructor) audioContextRef.current = new AudioContextConstructor();
      }
      void audioContextRef.current?.resume();

      if (!applauseBufferRef.current) {
        fetch(APPLAUSE_AUDIO_SRC)
          .then((res) => res.arrayBuffer())
          .then((buf) => audioContextRef.current?.decodeAudioData(buf))
          .then((decoded) => {
            if (decoded) applauseBufferRef.current = decoded;
          })
          .catch(() => {});
      }
    }
  };

  const beginSurprise = () => {
    unlockAudioContext();
    setProgress(0);
    setCanReplay(false);
    setRun((current) => current + 1);

    if (validQuiz && validQuiz.length > 0) {
      setQuizStep(0);
      setSelectedAnswer(null);
      setIsAnswerWrong(false);
      setShowHint(false);
      setPhase('quiz');
    } else {
      setPhase('loading');
    }
  };

  const handleQuizAnswer = (index: number) => {
    if (!validQuiz) return;
    const currentQ = validQuiz[quizStep];
    setSelectedAnswer(index);

    if (index === currentQ.correctIndex) {
      setIsAnswerWrong(false);
      setShowHint(false);

      if (audioContextRef.current && audioContextRef.current.state === 'running') {
        const pingMaster = audioContextRef.current.createGain();
        pingMaster.gain.setValueAtTime(0.18, audioContextRef.current.currentTime);
        pingMaster.connect(audioContextRef.current.destination);
        playTone(audioContextRef.current, pingMaster, audioContextRef.current.currentTime, 880, 0.15, 0.25, 'sine');
        playTone(audioContextRef.current, pingMaster, audioContextRef.current.currentTime + 0.1, 1320, 0.35, 0.3, 'sine');
      }

      window.setTimeout(() => {
        if (quizStep + 1 < validQuiz.length) {
          setQuizStep((s) => s + 1);
          setSelectedAnswer(null);
        } else {
          setPhase('loading');
        }
      }, 700);
    } else {
      setIsAnswerWrong(true);
      if (currentQ.hint) setShowHint(true);
    }
  };

  const handleCertificateClick = () => {
    if (!isPaymentApproved) {
      setShowPaymentModal(true);
      return;
    }
    void downloadCertificate();
  };

  const downloadCertificate = async () => {
    setGeneratingCert(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1600;
      canvas.height = 1130;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Dark luxury background
      const bgGrad = ctx.createLinearGradient(0, 0, 1600, 1130);
      bgGrad.addColorStop(0, '#040711');
      bgGrad.addColorStop(0.5, '#0b1329');
      bgGrad.addColorStop(1, '#040711');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1600, 1130);

      // Gold ornate borders
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 14;
      ctx.strokeRect(40, 40, 1520, 1050);

      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.strokeRect(60, 60, 1480, 1010);

      // Corner ornaments
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(40, 40, 40, 40);
      ctx.fillRect(1520, 40, 40, 40);
      ctx.fillRect(40, 1050, 40, 40);
      ctx.fillRect(1520, 1050, 40, 40);

      // Load and draw recipient photo in gold luxury frame
      const photoSize = 170;
      const photoX = 800 - photoSize / 2;
      const photoY = 120;

      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = resolve; // Continue even if external image fails
          img.src = imageUrl;
        });

        if (img.complete && img.naturalWidth > 0) {
          ctx.save();
          // Draw gold frame shadow & border
          ctx.beginPath();
          ctx.arc(800, photoY + photoSize / 2, photoSize / 2 + 8, 0, Math.PI * 2);
          ctx.fillStyle = '#f59e0b';
          ctx.shadowColor = 'rgba(245, 158, 11, 0.45)';
          ctx.shadowBlur = 24;
          ctx.fill();

          // Clip image to circle
          ctx.beginPath();
          ctx.arc(800, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(img, photoX, photoY, photoSize, photoSize);
          ctx.restore();
        }
      } catch {}

      // Header Tag
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('★ OFFICIAL RECOGNITION & CELEBRATION ★', 800, 335);

      // Title
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 54px sans-serif';
      ctx.fillText('CERTIFICATE OF RECOGNITION', 800, 415);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '24px sans-serif';
      ctx.fillText('This honor and celebration is proudly presented to', 800, 475);

      // Recipient Name in large gold
      ctx.fillStyle = '#fcd34d';
      ctx.font = 'bold 72px sans-serif';
      ctx.fillText(recipientName, 800, 580);

      // Underline bar
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(450, 610, 700, 4);

      // Achievement
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 38px sans-serif';
      ctx.fillText(achievement, 800, 690);

      // Personal message
      if (message) {
        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'italic 26px sans-serif';
        const msgText = `"${message.slice(0, 130)}"`;
        ctx.fillText(msgText, 800, 765);
      }

      // Footer divider
      ctx.fillStyle = '#334155';
      ctx.fillRect(200, 860, 1200, 2);

      // Organization & Date
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('BRIDGETECH CELEBRATION STUDIO', 800, 935);

      ctx.fillStyle = '#64748b';
      ctx.font = '20px sans-serif';
      ctx.fillText(`Official Verification ID: ${code || 'BT-VIP'} · ${new Date().toLocaleDateString(undefined, { dateStyle: 'long' })} · Sierra Leone`, 800, 980);

      const link = document.createElement('a');
      link.download = `${recipientName.replace(/\s+/g, '_')}_Official_Certificate.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.warn('Certificate generation failed:', e);
    } finally {
      setGeneratingCert(false);
    }
  };

  const handleSubmitPaymentProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      alert('Please enter a valid email address to receive your certificate.');
      return;
    }

    setSubmittingPayment(true);
    try {
      const response = await fetch('/api/surprise-reveals/submit-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim(),
          selectedPlan,
          paymentMethod: payMethod,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setPaymentSubmitted(true);
        if (result.waUrl) {
          window.open(result.waUrl, '_blank', 'noopener,noreferrer');
        }
      } else {
        alert(result.error || 'Failed to submit payment details.');
      }
    } catch {
      alert('An error occurred while submitting payment. Please contact WhatsApp +232 33 399 391 directly.');
    } finally {
      setSubmittingPayment(false);
    }
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
              className="flex flex-col items-center max-w-md w-full px-4"
            >
              <div className="h-20 w-20 overflow-hidden rounded-2xl border-2 border-amber-300/80 bg-stone-900 p-1.5 shadow-[0_0_0_8px_rgba(246,196,83,0.12)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="" className="h-full w-full rounded-xl object-cover" />
              </div>

              {validQuiz ? (
                <div className="mt-6 flex flex-col items-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 px-3.5 py-1 text-xs font-bold text-amber-300 border border-amber-300/20">
                    <HelpCircle className="h-3.5 w-3.5" /> {validQuiz.length} {validQuiz.length === 1 ? 'Question' : 'Questions'} to Unlock
                  </span>
                  <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">Are you ready, {recipientName}?</h2>
                  <p className="mt-1.5 text-xs text-stone-400 sm:text-sm">Complete the quick interactive quiz to unlock your VIP surprise!</p>
                </div>
              ) : (
                <div className="mt-6">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 px-3.5 py-1 text-xs font-bold text-amber-300 border border-amber-300/20">
                    <Sparkles className="h-3.5 w-3.5" /> VIP Celebration
                  </span>
                </div>
              )}

              <motion.button
                type="button"
                onClick={beginSurprise}
                whileHover={reduceMotion ? undefined : { scale: 1.025 }}
                whileTap={{ scale: 0.98 }}
                className="relative mt-8 flex min-h-16 w-full max-w-xs items-center justify-center overflow-hidden rounded-xl border border-amber-100 bg-amber-400 px-8 text-lg font-black text-neutral-950 shadow-[0_14px_0_#a15c11,0_26px_60px_rgba(246,196,83,0.28)] focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-200/60"
              >
                <motion.span
                  aria-hidden="true"
                  initial={{ x: '-150%' }}
                  animate={{ x: '170%' }}
                  transition={{ duration: 1.65, repeat: Infinity, repeatDelay: 0.95, ease: 'easeInOut' }}
                  className="pointer-events-none absolute inset-y-[-30%] w-16 -skew-x-12 bg-white/75"
                />
                <span className="relative">{validQuiz ? 'Start & Unlock ✨' : 'Your Surprise'}</span>
              </motion.button>
            </motion.div>
          )}

          {phase === 'quiz' && validQuiz && (
            <motion.div
              key={`quiz-step-${quizStep}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-lg rounded-3xl border border-amber-400/30 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur text-left"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4" /> Question {quizStep + 1} of {validQuiz.length}
                </span>
                <span className="text-xs font-mono text-stone-400">
                  {Math.round(((quizStep) / validQuiz.length) * 100)}% complete
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                {validQuiz[quizStep].question}
              </h3>

              <div className="mt-6 space-y-3">
                {validQuiz[quizStep].options.map((option, idx) => {
                  const isSelected = selectedAnswer === idx;
                  const isCorrect = idx === validQuiz[quizStep].correctIndex;
                  let btnClass = 'border-white/15 bg-white/5 text-white hover:border-amber-400 hover:bg-amber-400/10';

                  if (isSelected && isCorrect) {
                    btnClass = 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]';
                  } else if (isSelected && !isCorrect) {
                    btnClass = 'border-rose-500 bg-rose-500/20 text-rose-300';
                  }

                  return (
                    <motion.button
                      key={idx}
                      type="button"
                      onClick={() => handleQuizAnswer(idx)}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border text-sm sm:text-base font-bold transition-all text-left ${btnClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-xs font-bold">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{option}</span>
                      </div>
                      {isSelected && isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />}
                    </motion.button>
                  );
                })}
              </div>

              {isAnswerWrong && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200"
                >
                  <p className="font-bold">Not quite! Try again 😊</p>
                  {showHint && validQuiz[quizStep].hint && (
                    <p className="mt-1 text-amber-300">💡 Hint: {validQuiz[quizStep].hint}</p>
                  )}
                </motion.div>
              )}
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
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-3 max-w-md w-full px-4"
                  >
                    <motion.button
                      type="button"
                      onClick={beginSurprise}
                      className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-amber-100/60 px-4 text-xs sm:text-sm font-black text-amber-100 transition hover:bg-amber-400 hover:text-neutral-950"
                    >
                      <RotateCcw className="h-4 w-4" /> Replay
                    </motion.button>

                    <motion.a
                      href={`https://wa.me/?text=${encodeURIComponent(`🎉 Look at this special surprise!\n\n${recipientName} just received a special recognition – ${achievement}${presenterName ? ` from ${presenterName}` : ''}!\n\nSee the surprise reveal 👉 ${shareUrl ?? (typeof window !== 'undefined' ? window.location.href : '')}\n\n🌟 Made with BridgeTec Surprise Studio`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 text-xs sm:text-sm font-black text-white transition hover:bg-[#1ebe5d]"
                    >
                      <Share2 className="h-4 w-4" /> WhatsApp
                    </motion.a>

                    {!isPaymentApproved && (
                      <ProtectedCertificatePreview
                        recipientName={recipientName}
                        achievement={achievement}
                        message={message}
                        presenterName={presenterName}
                        imageUrl={imageUrl}
                        code={code}
                        onUnlockClick={() => setShowPaymentModal(true)}
                        inline={false}
                      />
                    )}

                    <motion.button
                      type="button"
                      onClick={handleCertificateClick}
                      disabled={generatingCert}
                      className={`w-full inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-xs sm:text-sm font-black transition-all shadow-lg ${
                        isPaymentApproved
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 shadow-amber-500/20'
                          : 'bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 shadow-amber-500/25'
                      }`}
                    >
                      {isPaymentApproved ? (
                        <>
                          <Award className="h-4 w-4" />
                          <span>{generatingCert ? 'Rendering Certificate...' : 'Download Official Certificate (PNG)'}</span>
                          <Download className="h-4 w-4 ml-1" />
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 text-slate-950" />
                          <span>Unlock Printable Certificate (Le 25)</span>
                          <Sparkles className="h-3.5 w-3.5 ml-1 text-slate-900" />
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Payment Approval / Certificate Unlock Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              className="relative w-full max-w-lg rounded-3xl border border-amber-400/40 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 sm:p-7 shadow-2xl text-left text-white my-8"
            >
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Unlock Official Printable Certificate</h3>
                  <p className="text-xs text-amber-300 font-bold">Select Plan &amp; Confirm Payment via WhatsApp</p>
                </div>
              </div>

              {!paymentSubmitted ? (
                <form onSubmit={handleSubmitPaymentProof} className="mt-4 space-y-4 text-xs text-slate-300">
                  {/* Plan Selector */}
                  <div>
                    <label className="block text-[11px] font-black uppercase text-amber-300 mb-2">1. Choose Your Plan</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPlan('single')}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          selectedPlan === 'single'
                            ? 'border-amber-400 bg-amber-400/20 text-white shadow-md'
                            : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-sm font-black text-amber-300">Le 25</div>
                        <div className="text-[10px] font-bold mt-0.5">Single Use</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedPlan('monthly')}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          selectedPlan === 'monthly'
                            ? 'border-amber-400 bg-amber-400/20 text-white shadow-md'
                            : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-sm font-black text-amber-300">Le 150</div>
                        <div className="text-[10px] font-bold mt-0.5">Monthly (5 uses)</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedPlan('lifetime')}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          selectedPlan === 'lifetime'
                            ? 'border-amber-400 bg-amber-400/20 text-white shadow-md'
                            : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-sm font-black text-amber-300">Le 500</div>
                        <div className="text-[10px] font-bold mt-0.5">Lifetime VIP</div>
                      </button>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <label className="block text-[11px] font-black uppercase text-amber-300 mb-2">2. Payment Method</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPayMethod('orange_money')}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          payMethod === 'orange_money'
                            ? 'border-orange-500 bg-orange-500/20 text-white'
                            : 'border-white/10 bg-white/5 text-slate-400'
                        }`}
                      >
                        <span className="text-base">🟠</span>
                        <div>
                          <div className="font-bold text-white text-xs">Orange Money</div>
                          <div className="text-[10px] text-orange-300 font-mono">*144*2*2*241586#</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPayMethod('afrimoney')}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          payMethod === 'afrimoney'
                            ? 'border-emerald-500 bg-emerald-500/20 text-white'
                            : 'border-white/10 bg-white/5 text-slate-400'
                        }`}
                      >
                        <span className="text-base">💚</span>
                        <div>
                          <div className="font-bold text-white text-xs">AfriMoney</div>
                          <div className="text-[10px] text-emerald-300 font-mono">+232 33 399 391</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Customer Email & Phone Input */}
                  <div className="space-y-2.5 pt-1">
                    <label className="block text-[11px] font-black uppercase text-amber-300">3. Your Contact for Certificate Delivery</label>
                    <div>
                      <input
                        type="email"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="Your Email (to receive the official certificate) *"
                        className="w-full bg-slate-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        We will automatically email your high-resolution certificate link as soon as payment is confirmed.
                      </p>
                    </div>

                    <div>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Your WhatsApp Number (e.g. +232 7X XXX XXX)"
                        className="w-full bg-slate-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  <div className="pt-2 space-y-2">
                    <button
                      type="submit"
                      disabled={submittingPayment}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] p-3 text-xs font-black text-white transition-all shadow-lg shadow-green-600/25 disabled:opacity-50"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>{submittingPayment ? 'Submitting Details...' : 'Submit & Send Proof on WhatsApp (+232 33 399 391)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(false)}
                      className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 p-2.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-4 space-y-4 text-xs text-slate-300 animate-fade-in text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto text-2xl">
                    ✓
                  </div>
                  <h4 className="text-base font-black text-white">Payment Proof Submitted!</h4>
                  <p className="text-slate-300 leading-relaxed max-w-sm mx-auto">
                    We sent a confirmation email to <strong className="text-white">{customerEmail}</strong>.
                    As soon as our admin verifies your payment, you will receive your direct certificate download link via Email and WhatsApp!
                  </p>

                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(false)}
                      className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all"
                    >
                      Got it, Back to Celebration
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

