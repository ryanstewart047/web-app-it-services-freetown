import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, sanitizeText } from '@/lib/admin-guard';
import {
  createSurpriseReveal,
  getSurpriseReveals,
  removeSurpriseReveal,
} from '@/lib/surprise-reveal-storage';

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
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const reveals = await getSurpriseReveals();
    return NextResponse.json({
      success: true,
      reveals: reveals.map((reveal) => ({ ...reveal, shareUrl: getPublicUrl(request, reveal.code) })),
    });
  } catch (error) {
    console.error('[Surprise Reveal Admin] Fetch error:', error);
    return NextResponse.json({ success: false, error: 'Unable to load Surprise Reveals.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const recipientName = sanitizeText(body.recipientName).slice(0, 90);
    const achievement = sanitizeText(body.achievement).slice(0, 160);
    const message = sanitizeText(body.message).slice(0, 500);
    const imageUrl = typeof body.imageUrl === 'string' ? body.imageUrl.trim() : '';

    if (!recipientName) {
      return NextResponse.json({ success: false, error: 'Add the recipient\'s name.' }, { status: 400 });
    }
    if (!achievement) {
      return NextResponse.json({ success: false, error: 'Add the achievement to reveal.' }, { status: 400 });
    }
    if (!isImageUrl(imageUrl)) {
      return NextResponse.json({ success: false, error: 'Upload a valid image or paste an image URL.' }, { status: 400 });
    }

    const reveal = await createSurpriseReveal({ recipientName, achievement, message, imageUrl });
    return NextResponse.json({ success: true, reveal, shareUrl: getPublicUrl(request, reveal.code) }, { status: 201 });
  } catch (error) {
    console.error('[Surprise Reveal Admin] Create error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unable to create the Surprise Reveal.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const code = new URL(request.url).searchParams.get('code') || '';
  if (!/^celebrate-[a-f0-9]{10}$/.test(code)) {
    return NextResponse.json({ success: false, error: 'Invalid Surprise Reveal.' }, { status: 400 });
  }

  try {
    const removed = await removeSurpriseReveal(code);
    if (!removed) {
      return NextResponse.json({ success: false, error: 'This Surprise Reveal no longer exists.' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Surprise Reveal Admin] Delete error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unable to remove the Surprise Reveal.' },
      { status: 500 }
    );
  }
}
