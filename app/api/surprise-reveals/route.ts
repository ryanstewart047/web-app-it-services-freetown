import { NextRequest, NextResponse } from 'next/server';
import { sanitizeText } from '@/lib/admin-guard';
import {
  createSurpriseReveal,
  getSurpriseReveal,
  type QuizQuestion,
} from '@/lib/surprise-reveal-storage';
import { DEFAULT_SURPRISE_SOUND_EFFECT, isSurpriseSoundEffect } from '@/lib/surprise-reveal-sounds';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_IMAGE_DATA_URL_BYTES = 8 * 1024 * 1024;

function isImageUrl(value: string) {
  if (value.startsWith('data:image/')) {
    const content = value.includes(',') ? value.split(',').pop() || '' : '';
    return Math.ceil((content.length * 3) / 4) <= MAX_IMAGE_DATA_URL_BYTES;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function getPublicUrl(request: NextRequest, code: string) {
  const origin = request.headers.get('origin') || request.nextUrl.origin;
  return `${origin.replace(/\/$/, '')}/surprise/${code}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  if (!code) {
    return NextResponse.json({ success: false, error: 'Reveal code is required.' }, { status: 400 });
  }

  try {
    const reveal = await getSurpriseReveal(code);
    if (!reveal) {
      return NextResponse.json({ success: false, error: 'Reveal not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, reveal, shareUrl: getPublicUrl(request, reveal.code) });
  } catch (error) {
    console.error('[Surprise Reveal Public API] Get error:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve reveal.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const recipientName = sanitizeText(body.recipientName || '').slice(0, 90);
    const achievement = sanitizeText(body.achievement || '').slice(0, 160);
    const message = sanitizeText(body.message || '').slice(0, 500);
    const imageUrl = typeof body.imageUrl === 'string' ? body.imageUrl.trim() : '';
    const requestedSoundEffect = typeof body.soundEffect === 'string' ? body.soundEffect : '';
    const soundEffect = isSurpriseSoundEffect(requestedSoundEffect) ? requestedSoundEffect : DEFAULT_SURPRISE_SOUND_EFFECT;
    const isVip = Boolean(body.isVip);

    // Validate quiz questions if supplied
    let quiz: QuizQuestion[] | undefined;
    if (Array.isArray(body.quiz)) {
      quiz = body.quiz
        .filter((q: unknown): q is Record<string, any> => Boolean(q && typeof q === 'object'))
        .map((q: Record<string, any>) => ({
          question: sanitizeText(String(q.question || '')).slice(0, 150),
          options: Array.isArray(q.options)
            ? q.options.map((opt: unknown) => sanitizeText(String(opt || '')).slice(0, 80)).filter(Boolean)
            : [],
          correctIndex: typeof q.correctIndex === 'number' ? Math.max(0, Math.min(3, q.correctIndex)) : 0,
          hint: typeof q.hint === 'string' ? sanitizeText(q.hint).slice(0, 120) : undefined,
        }))
        .filter((q: QuizQuestion) => q.question.length > 0 && q.options.length >= 2);
    }

    if (!recipientName) {
      return NextResponse.json({ success: false, error: 'Recipient name is required.' }, { status: 400 });
    }
    if (!achievement) {
      return NextResponse.json({ success: false, error: 'Achievement or milestone is required.' }, { status: 400 });
    }
    if (!isImageUrl(imageUrl)) {
      return NextResponse.json({ success: false, error: 'Please upload a photo or provide a valid image URL.' }, { status: 400 });
    }

    const reveal = await createSurpriseReveal({
      recipientName,
      achievement,
      message,
      imageUrl,
      soundEffect,
      quiz: quiz && quiz.length > 0 ? quiz : undefined,
      isVip,
    });

    const shareUrl = getPublicUrl(request, reveal.code);
    return NextResponse.json({ success: true, reveal, shareUrl }, { status: 201 });
  } catch (error) {
    console.error('[Surprise Reveal Public API] Create error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unable to create the Surprise Reveal.' },
      { status: 500 }
    );
  }
}
