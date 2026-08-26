export const DEFAULT_SURPRISE_SOUND_EFFECT = 'golden-fanfare';

export const SURPRISE_SOUND_EFFECTS = [
  { value: 'golden-fanfare', label: 'Golden fanfare' },
  { value: 'sparkle-cascade', label: 'Sparkle cascade' },
  { value: 'celebration-drums', label: 'Celebration drums' },
  { value: 'spotlight-chime', label: 'Spotlight chime' },
  { value: 'silent', label: 'No sound' },
] as const;

export type SurpriseSoundEffect = (typeof SURPRISE_SOUND_EFFECTS)[number]['value'];

export function isSurpriseSoundEffect(value: unknown): value is SurpriseSoundEffect {
  return typeof value === 'string' && SURPRISE_SOUND_EFFECTS.some((effect) => effect.value === value);
}
