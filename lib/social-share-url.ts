export function cleanSocialShareDestination(value: unknown, baseUrl?: string): string | null {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  // Product-card copy can include a URL followed by the name, price, and description.
  // Keep only the first URL so the saved destination is always a real page address.
  const embeddedUrl = trimmed.match(/https?:\/\/[^\s<>"']+/i)?.[0];
  let candidate = (embeddedUrl || trimmed).replace(/[),.;!?]+$/, '');

  if (candidate.startsWith('/')) {
    if (!baseUrl) return null;
    candidate = `${baseUrl.replace(/\/$/, '')}${candidate}`;
  } else if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  try {
    const parsed = new URL(candidate);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.toString() : null;
  } catch {
    return null;
  }
}
