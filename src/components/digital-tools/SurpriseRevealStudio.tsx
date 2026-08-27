'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import Link from 'next/link';
import {
  Award,
  Check,
  CheckCircle2,
  Copy,
  Crown,
  ExternalLink,
  Gift,
  GraduationCap,
  Heart,
  HelpCircle,
  ImagePlus,
  Loader2,
  MessageCircle,
  Music,
  PartyPopper,
  Play,
  Plus,
  QrCode,
  RotateCcw,
  Share2,
  Sparkles,
  Trash2,
  Trophy,
  Upload,
  Volume2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DEFAULT_SURPRISE_SOUND_EFFECT, SURPRISE_SOUND_EFFECTS, type SurpriseSoundEffect } from '@/lib/surprise-reveal-sounds';
import { type QuizQuestion } from '@/lib/surprise-reveal-storage';
import ProtectedCertificatePreview from './ProtectedCertificatePreview';
import PaymentCheckout from './PaymentCheckout';

interface PresetTemplate {
  id: string;
  name: string;
  icon: string;
  achievement: string;
  message: string;
  defaultQuestions: QuizQuestion[];
  soundEffect: SurpriseSoundEffect;
}

const OCCASION_PRESETS: PresetTemplate[] = [
  {
    id: 'staff',
    name: 'Staff & Team Recognition',
    icon: '🏆',
    achievement: 'Outstanding Team Member of the Quarter',
    message: 'Your tireless dedication, brilliant creativity, and positive leadership inspire the entire team every day!',
    soundEffect: 'hand-clap-cheer',
    defaultQuestions: [
      {
        question: 'Who consistently delivers top-tier results and uplifts the whole team?',
        options: ['Our Amazing Celebrant Today!', 'Someone in Another Department', 'Not Sure', 'Nobody'],
        correctIndex: 0,
        hint: 'It is the incredible person we are honoring right now!',
      },
      {
        question: 'What quality best describes today\'s honoree at work?',
        options: ['Hardworking & Inspiring', 'Always Late', 'Rarely Present', 'Does the Minimum'],
        correctIndex: 0,
        hint: 'Think about what makes them special in the team!',
      },
      {
        question: 'Which award best describes today\'s recognition?',
        options: ['Outstanding Team Member of the Quarter', 'Best Parking Spot Award', 'Fastest Lunch Break', 'Longest Meeting Attendee'],
        correctIndex: 0,
        hint: 'It is a prestigious quarterly recognition!',
      },
    ],
  },
  {
    id: 'birthday',
    name: 'Birthday & Milestone',
    icon: '🎂',
    achievement: 'Happy Birthday & Golden Milestone!',
    message: 'Wishing you overflowing joy, vibrant health, and massive success in this new chapter of life!',
    soundEffect: 'hand-clap-cheer',
    defaultQuestions: [
      {
        question: 'What special occasion are we celebrating today with joy?',
        options: ['A Milestone Birthday! 🎂', 'Just a Regular Monday', 'A Team Meeting', 'Tax Deadline'],
        correctIndex: 0,
        hint: 'Hint: Candles, cake, wishes, and celebration!',
      },
      {
        question: 'Which best describes how today\'s birthday person makes others feel?',
        options: ['Loved, Happy & Special Every Day', 'Neutral Most Times', 'Barely Noticed', 'Hard to Be Around'],
        correctIndex: 0,
        hint: 'Think about their warm personality!',
      },
      {
        question: 'What is the best gift you can give someone on their special day?',
        options: ['Your Heartfelt Love & This Surprise! 🎁', 'A Bill They Owe You', 'Extra Work', 'Nothing at All'],
        correctIndex: 0,
        hint: 'This very surprise reveal IS the answer!',
      },
    ],
  },
  {
    id: 'graduation',
    name: 'Graduation & Academic Honors',
    icon: '🎓',
    achievement: 'Official Graduation & Academic Distinction',
    message: 'All the late nights, hard work, and determination have paid off. We are so incredibly proud of your milestone!',
    soundEffect: 'golden-fanfare',
    defaultQuestions: [
      {
        question: 'What incredible feat did our scholar just conquer?',
        options: ['Earned Their Degree with Flying Colors! 🎓', 'Won a Video Game Tournament', 'Woke Up Early', 'Survived a Meeting'],
        correctIndex: 0,
        hint: 'Think caps, gowns, and diplomas!',
      },
      {
        question: 'How many years of hard work and dedication did this achievement take?',
        options: ['Years of Consistent Effort & Sacrifice', 'Just One Afternoon', 'A Lucky Guess', 'It Happened by Accident'],
        correctIndex: 0,
        hint: 'Academic journeys require true perseverance!',
      },
      {
        question: 'What comes next after this grand graduation milestone?',
        options: ['A Bright & Limitless Future! 🌟', 'Going Back to Square One', 'Staying the Same', 'No Plans at All'],
        correctIndex: 0,
        hint: 'Graduation is just the beginning of greatness!',
      },
    ],
  },
  {
    id: 'anniversary',
    name: 'Romantic / Anniversary',
    icon: '💍',
    achievement: 'Happy Anniversary & Everlasting Love',
    message: 'Every moment with you is a treasure. Thank you for filling life with love, laughter, and pure happiness!',
    soundEffect: 'sparkle-cascade',
    defaultQuestions: [
      {
        question: 'Who holds the key to my heart and makes every single day magical?',
        options: ['My One & Only True Love 💕', 'The Mailman', 'A Friendly Stranger', 'No Idea At All'],
        correctIndex: 0,
        hint: 'The most extraordinary person in the universe!',
      },
      {
        question: 'What do we celebrate together on this special anniversary?',
        options: ['Our Beautiful Love Story & Journey Together', 'A Regular Tuesday', 'Nothing in Particular', 'Work Deadlines'],
        correctIndex: 0,
        hint: 'Think hearts, roses, and memories!',
      },
      {
        question: 'What is the secret ingredient that makes our relationship so beautiful?',
        options: ['Trust, Respect & Unconditional Love 💖', 'Constant Arguments', 'Ignoring Each Other', 'Just Luck'],
        correctIndex: 0,
        hint: 'It is the foundation of every lasting bond!',
      },
    ],
  },
];

function prepareRevealImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      try {
        const maxSide = 1200;
        const ratio = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
        const width = Math.max(1, Math.round(image.naturalWidth * ratio));
        const height = Math.max(1, Math.round(image.naturalHeight * ratio));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Image canvas unavailable.');

        context.fillStyle = '#0f172a';
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.86));
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Unable to process this image file.'));
    };
    image.src = objectUrl;
  });
}

export default function SurpriseRevealStudio() {
  const [recipientName, setRecipientName] = useState('');
  const [presenterName, setPresenterName] = useState('');
  const [achievement, setAchievement] = useState('Staff Member of the Quarter');
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('/assets/images/slide01.jpg');
  const [soundEffect, setSoundEffect] = useState<SurpriseSoundEffect>('hand-clap-cheer');
  const [enableQuiz, setEnableQuiz] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      question: 'Who are we honoring for outstanding excellence today?',
      options: ['Our Superstar Celebrant', 'Nobody Special', 'The Robot', 'Unknown'],
      correctIndex: 0,
      hint: 'The person whose name is on the celebration!',
    },
  ]);

  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishedReveal, setPublishedReveal] = useState<{ code: string; shareUrl: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [playingAudioPreview, setPlayingAudioPreview] = useState(false);
  const [showPaymentCheckout, setShowPaymentCheckout] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const applyPreset = (preset: PresetTemplate) => {
    setAchievement(preset.achievement);
    setMessage(preset.message);
    setSoundEffect(preset.soundEffect);
    if (preset.defaultQuestions.length > 0) {
      setQuestions(preset.defaultQuestions);
      setEnableQuiz(true);
    }
    toast.success(`Applied ${preset.name} template!`);
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose a valid photo (JPG, PNG, WEBP).');
      return;
    }

    setUploading(true);
    try {
      const optimized = await prepareRevealImage(file);
      setImageUrl(optimized);
      toast.success('Photo ready for the reveal!');
    } catch {
      toast.error('Could not process photo.');
    } finally {
      setUploading(false);
    }
  };

  const playPreviewSound = () => {
    if (playingAudioPreview) return;
    setPlayingAudioPreview(true);

    try {
      const audio = new Audio('/assets/audio/hand-clap-cheering.m4a');
      audio.volume = 0.85;
      audio.currentTime = 0;
      audio.play().catch(() => {});
      setTimeout(() => {
        audio.pause();
        setPlayingAudioPreview(false);
      }, 5000);
    } catch {
      setPlayingAudioPreview(false);
    }
  };

  const addQuestion = () => {
    if (questions.length >= 3) {
      toast.error('Maximum 3 questionnaire unlock questions recommended for best mobile engagement.');
      return;
    }
    setQuestions([
      ...questions,
      {
        question: `Question ${questions.length + 1}`,
        options: ['Option A (Correct)', 'Option B', 'Option C', 'Option D'],
        correctIndex: 0,
        hint: 'Think about a fun memory!',
      },
    ]);
  };

  const updateQuestion = (index: number, updated: Partial<QuizQuestion>) => {
    setQuestions(questions.map((q, i) => (i === index ? { ...q, ...updated } : q)));
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) {
      setEnableQuiz(false);
    }
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const publishReveal = async () => {
    if (!recipientName.trim()) {
      toast.error('Please enter the recipient\'s name.');
      return;
    }
    if (!achievement.trim()) {
      toast.error('Please enter the achievement / occasion.');
      return;
    }
    if (!imageUrl.trim()) {
      toast.error('Please upload a photo for the celebration.');
      return;
    }

    setPublishing(true);
    try {
      const response = await fetch('/api/surprise-reveals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName,
          achievement,
          message,
          presenterName: presenterName.trim() || undefined,
          imageUrl,
          soundEffect,
          quiz: enableQuiz ? questions : undefined,
          isVip: false,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to publish reveal.');
      }

      setPublishedReveal({
        code: data.reveal.code,
        shareUrl: data.shareUrl,
      });

      toast.success('🎉 Surprise Reveal link created successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Could not create reveal.');
    } finally {
      setPublishing(false);
    }
  };

  const copyShareLink = async () => {
    if (!publishedReveal) return;
    await navigator.clipboard.writeText(publishedReveal.shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const openWhatsAppShare = () => {
    if (!publishedReveal) return;
    const presenterCredit = presenterName ? ` from ${presenterName}` : '';
    const text = `🎉 Look at this special surprise!\n\n${recipientName} has a personalized celebration reveal${presenterCredit} waiting for them!\n\nTap to open the reveal 👉 ${publishedReveal.shareUrl}\n\n🌟 Created with BridgeTec Surprise Studio`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const orderVipPackage = () => {
    setShowPaymentCheckout(true);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur space-y-8 max-w-4xl mx-auto text-white">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-orange-500 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-amber-500/20">
            <Heart className="w-6 h-6 fill-current text-white animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-black text-white sm:text-2xl">
                BridgeTec Surprise Studio
              </h2>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                ❤️ Viral Surprise Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Create unforgettable celebration reveals with interactive unlock questions, dynamic presenter styling, custom photo reveals, stadium cheering &amp; high-end printable certificates.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={orderVipPackage}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black transition-all shadow-md shadow-amber-500/20"
        >
          <Crown className="w-4 h-4 text-slate-950" />
          <span>Unlock HD Certificate (Le 25)</span>
        </button>
      </div>

      {/* Preset Occasion Templates */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          1. Quick-Start Occasion Templates
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {OCCASION_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950/70 hover:bg-slate-800/80 hover:border-amber-500/40 text-left transition-all group"
            >
              <span className="text-2xl block mb-1.5">{preset.icon}</span>
              <span className="text-xs font-bold text-white block group-hover:text-amber-300 transition-colors">
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid sm:grid-cols-2 gap-6 items-start">
        {/* Left Column: Details */}
        <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            2. Celebrant &amp; Presenter Details
          </label>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">Recipient's Full Name *</label>
            <input
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g. Mariama Sesay"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">
              Presenter / Issuer Name (Who is celebrating them?)
            </label>
            <input
              value={presenterName}
              onChange={(e) => setPresenterName(e.target.value)}
              placeholder="e.g. Google Africa Team, Mom & Dad, Management, Class of '24"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              ✨ Dynamically customizes certificate seal, colors, issuer name &amp; digital signature!
            </span>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">Achievement / Title to Reveal *</label>
            <input
              value={achievement}
              onChange={(e) => setAchievement(e.target.value)}
              placeholder="e.g. Senior Tech Lead of the Year"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">Personal Congratulatory Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="A heartfelt message celebrating their impact..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300">Celebration Sound &amp; FX</label>
              <button
                type="button"
                onClick={playPreviewSound}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{playingAudioPreview ? 'Playing (5s)...' : 'Test Hand Claps Audio'}</span>
              </button>
            </div>
            <select
              value={soundEffect}
              onChange={(e) => setSoundEffect(e.target.value as SurpriseSoundEffect)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-semibold focus:ring-2 focus:ring-amber-500"
            >
              {SURPRISE_SOUND_EFFECTS.map((fx) => (
                <option key={fx.value} value={fx.value}>
                  {fx.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Column: Photo Upload & Live Card Preview */}
        <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            3. Photo &amp; Visual Framing
          </label>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-amber-400 bg-slate-900 shadow-xl mb-3">
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>

            <div className="flex flex-col gap-2 w-full max-w-xs">
              <div className="flex gap-2 w-full">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                >
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>{uploading ? 'Processing...' : 'Upload Photo'}</span>
                </button>
              </div>

              <ProtectedCertificatePreview
                recipientName={recipientName || 'Mariama Sesay'}
                achievement={achievement || 'Outstanding Achievement'}
                message={message}
                presenterName={presenterName}
                imageUrl={imageUrl}
                onUnlockClick={orderVipPackage}
                inline={false}
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-2">Square or portrait photos look best</span>
          </div>
        </div>
      </div>

      {/* Interactive Questionnaire Section */}
      <div className="border-t border-slate-800 pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Interactive Unlock Questionnaire (Optional)</h3>
            </div>
            <p className="text-xs text-slate-400">
              Recipient must answer 1–3 fun questions before the surprise reveals!
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enableQuiz}
              onChange={(e) => setEnableQuiz(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>

        {enableQuiz && (
          <div className="space-y-4 animate-fade-in bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
            {questions.map((q, qIndex) => (
              <div key={qIndex} className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400">Question {qIndex + 1}</span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <input
                  value={q.question}
                  onChange={(e) => updateQuestion(qIndex, { question: e.target.value })}
                  placeholder="e.g. Who holds the record for most coffee cups today?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-amber-500"
                />

                <div className="space-y-2">
                  <label className="text-[11px] text-slate-400 block font-medium">
                    Options (Select the radio button to mark the CORRECT answer):
                  </label>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIndex) => (
                      <div
                        key={optIndex}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs ${
                          q.correctIndex === optIndex
                            ? 'border-emerald-500/60 bg-emerald-500/10'
                            : 'border-slate-800 bg-slate-950'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={q.correctIndex === optIndex}
                          onChange={() => updateQuestion(qIndex, { correctIndex: optIndex })}
                          className="accent-emerald-500 cursor-pointer"
                        />
                        <input
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...q.options];
                            newOpts[optIndex] = e.target.value;
                            updateQuestion(qIndex, { options: newOpts });
                          }}
                          className="w-full bg-transparent border-none text-xs text-white focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <input
                    value={q.hint || ''}
                    onChange={(e) => updateQuestion(qIndex, { hint: e.target.value })}
                    placeholder="Optional helpful hint if they guess wrong..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-[11px] text-slate-400 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            ))}

            {questions.length < 3 && (
              <button
                type="button"
                onClick={addQuestion}
                className="w-full py-2.5 border border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl text-xs font-bold text-slate-300 hover:text-amber-300 flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Another Question ({questions.length}/3)
              </button>
            )}
          </div>
        )}
      </div>

      {/* Publish & Results Section */}
      <div className="border-t border-slate-800 pt-6 space-y-5">
        {!publishedReveal ? (
          <button
            type="button"
            onClick={publishReveal}
            disabled={publishing || uploading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:opacity-95 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-all disabled:opacity-50"
          >
            {publishing ? <Loader2 className="w-5 h-5 animate-spin" /> : <PartyPopper className="w-5 h-5" />}
            <span>{publishing ? 'Generating Celebration Link...' : 'Publish & Generate Surprise Link'}</span>
          </button>
        ) : (
          <div className="bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border-2 border-amber-400/40 rounded-2xl p-6 space-y-5 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Celebration Link is Live!</span>
              </div>
              <button
                type="button"
                onClick={() => setPublishedReveal(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Create Another
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-emerald-400 truncate">
                {publishedReveal.shareUrl}
              </div>
              <button
                type="button"
                onClick={copyShareLink}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
              <a
                href={publishedReveal.shareUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Live</span>
              </a>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={openWhatsAppShare}
                className="flex-1 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Share Instantly on WhatsApp</span>
              </button>
            </div>

            {/* Instant Certificate Watermarked Preview to Prompt Purchase */}
            <div className="pt-3 border-t border-amber-400/20 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Printable Certificate Preview (Protected)</span>
              </div>
              <ProtectedCertificatePreview
                recipientName={recipientName || 'Mariama Sesay'}
                achievement={achievement || 'Outstanding Achievement'}
                message={message}
                presenterName={presenterName}
                imageUrl={imageUrl}
                code={publishedReveal.code}
                onUnlockClick={orderVipPackage}
                inline={true}
              />
            </div>
          </div>
        )}
      </div>

      {/* Pricing / Certificate Unlock Box */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-500/30 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-400 shrink-0" />
          <h4 className="text-sm font-bold text-white">Unlock Official Printable Certificate</h4>
        </div>
        <p className="text-xs text-slate-400">
          Admin approves payment in 1 click and the recipient&apos;s download unlocks instantly on their reveal page.
        </p>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-2.5 space-y-0.5">
            <div className="text-lg font-black text-amber-300">Le 25</div>
            <div className="text-[10px] text-slate-400 font-bold">Single Download</div>
          </div>
          <div className="rounded-xl border border-amber-400/20 bg-white/5 p-2.5 space-y-0.5">
            <div className="text-lg font-black text-amber-200">Le 150</div>
            <div className="text-[10px] text-slate-400 font-bold">Monthly (5 uses)</div>
          </div>
          <div className="rounded-xl border border-amber-400/20 bg-white/5 p-2.5 space-y-0.5">
            <div className="text-lg font-black text-amber-200">Le 500</div>
            <div className="text-[10px] text-slate-400 font-bold">Lifetime Pass</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/20 text-orange-300 px-2 py-0.5 font-bold border border-orange-500/30">🟠 Orange Money (*144#)</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 text-emerald-300 px-2 py-0.5 font-bold border border-emerald-500/30">💚 AfriMoney (*161#)</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 text-blue-300 px-2 py-0.5 font-bold border border-blue-500/30">🅿️ PayPal</span>
          <span className="text-slate-500">· USSD mobile trigger &amp; desktop QR code</span>
        </div>

        <button
          type="button"
          onClick={orderVipPackage}
          className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
        >
          <Crown className="w-4 h-4 text-slate-950" />
          <span>Unlock Official Printable Certificate</span>
        </button>
      </div>

      {showPaymentCheckout && (
        <PaymentCheckout
          recipientName={recipientName || 'Your Celebrant'}
          code="STUDIO-VIP"
          onClose={() => setShowPaymentCheckout(false)}
        />
      )}
    </div>
  );
}
