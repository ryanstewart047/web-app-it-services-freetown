'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { LockKeyhole, RotateCcw } from 'lucide-react';
import styles from './SurpriseRevealExperience.module.css';

interface SurpriseRevealExperienceProps {
  recipientName: string;
  achievement: string;
  message: string;
  imageUrl: string;
}

type RevealPhase = 'locked' | 'bursting' | 'visible';

const PARTICLE_TONES = ['#fbbf24', '#f59e0b', '#fde68a', '#ffffff'];

export default function SurpriseRevealExperience({
  recipientName,
  achievement,
  message,
  imageUrl,
}: SurpriseRevealExperienceProps) {
  const [phase, setPhase] = useState<RevealPhase>('locked');
  const [run, setRun] = useState(0);

  const particles = useMemo(() => Array.from({ length: 46 }, (_, index) => {
    const angle = ((index * 137.5) % 360) * (Math.PI / 180);
    const distance = 145 + ((index * 37) % 260);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance + 18;
    return {
      id: `${run}-${index}`,
      style: {
        '--x': `${x.toFixed(1)}px`,
        '--y': `${y.toFixed(1)}px`,
        '--size': `${4 + (index % 4) * 2}px`,
        '--tone': PARTICLE_TONES[index % PARTICLE_TONES.length],
        '--duration': `${800 + (index % 7) * 80}ms`,
        '--delay': `${(index % 6) * 22}ms`,
        '--rotation': `${(index % 2 ? 1 : -1) * (270 + index * 9)}deg`,
      } as CSSProperties,
    };
  }), [run]);

  useEffect(() => {
    const burstTimer = window.setTimeout(() => setPhase('bursting'), 540);
    const revealTimer = window.setTimeout(() => setPhase('visible'), 1320);

    return () => {
      window.clearTimeout(burstTimer);
      window.clearTimeout(revealTimer);
    };
  }, [run]);

  const replay = () => {
    setPhase('locked');
    setRun((current) => current + 1);
  };

  return (
    <main className={styles.screen}>
      <section className={`${styles.stage} ${phase === 'visible' ? styles.visible : ''}`} aria-live="polite">
        <div className={styles.locked} aria-hidden={phase === 'visible'}>
          <div className={styles.lockFrame}><LockKeyhole size={37} strokeWidth={1.7} /></div>
          <p className={styles.lockEyebrow}>A special moment is ready</p>
          <h1 className={styles.lockedTitle}>Your surprise is about to begin.</h1>
          <p className={styles.lockedHint}>Hold on to that smile.</p>
        </div>

        <div className={`${styles.burst} ${phase === 'bursting' || phase === 'visible' ? styles.bursting : ''}`} aria-hidden="true">
          {particles.map((particle) => <span key={particle.id} className={styles.particle} style={particle.style} />)}
        </div>

        <div className={styles.reveal}>
          <div className={styles.portraitWrap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={styles.portrait} src={imageUrl} alt={recipientName} />
          </div>
          <p className={styles.eyebrow}>Congratulations</p>
          <h1 className={styles.congratulations}>{recipientName}</h1>
          <p className={styles.achievement}>{achievement}</p>
          {message ? <p className={styles.message}>{message}</p> : null}
          <button type="button" className={styles.replay} onClick={replay}><RotateCcw size={15} /> Replay reveal</button>
          <p className={styles.signature}>A special celebration</p>
        </div>
      </section>
    </main>
  );
}
