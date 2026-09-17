import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, sanitizeText } from '@/lib/admin-guard';
import {
  getPartnersData,
  addPartner,
  updatePartner,
  deletePartner,
  updatePartnersSettings,
  reorderPartners,
  PartnerColorMode,
} from '@/lib/server/partners-store';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Max upload size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif',
];

function sanitizeUrl(input: unknown): string {
  const value = sanitizeText(input).trim().slice(0, 2000);
  if (!value) return '';

  if (value.startsWith('data:image/')) {
    return value;
  }

  try {
    const url = new URL(value);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url.toString();
    }
  } catch {
    if (value.startsWith('/') && !value.startsWith('//')) {
      return value;
    }
  }

  return '';
}

/**
 * GET /api/admin/partners
 * Returns all partners and section settings
 */
export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const data = await getPartnersData();
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error('[Admin/Partners API] GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch partners data.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/partners
 * Adds a new partner logo (via JSON or multipart/form-data with file upload)
 */
export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const contentType = request.headers.get('content-type') || '';
    let name = '';
    let logoUrl = '';
    let websiteUrl = '';
    let colorMode: PartnerColorMode | undefined;
    let active = true;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      name = sanitizeText(formData.get('name'));
      websiteUrl = sanitizeUrl(formData.get('websiteUrl'));
      colorMode = (formData.get('colorMode') as PartnerColorMode) || undefined;
      active = formData.get('active') !== 'false';

      const fileEntry = formData.get('file');
      const pastedUrl = sanitizeUrl(formData.get('logoUrl'));

      if (fileEntry instanceof File && fileEntry.size > 0) {
        if (!ALLOWED_MIME_TYPES.includes(fileEntry.type)) {
          return NextResponse.json(
            { success: false, error: 'Invalid file type. Please upload PNG, JPG, SVG, or WebP.' },
            { status: 400 }
          );
        }

        if (fileEntry.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            { success: false, error: 'File too large. Maximum allowed size is 5MB.' },
            { status: 400 }
          );
        }

        const buffer = Buffer.from(await fileEntry.arrayBuffer());
        logoUrl = `data:${fileEntry.type};base64,${buffer.toString('base64')}`;
      } else if (pastedUrl) {
        logoUrl = pastedUrl;
      }
    } else {
      const body = await request.json();
      name = sanitizeText(body.name);
      logoUrl = sanitizeUrl(body.logoUrl);
      websiteUrl = sanitizeUrl(body.websiteUrl);
      colorMode = body.colorMode;
      active = body.active !== false;
    }

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Partner name is required.' },
        { status: 400 }
      );
    }

    if (!logoUrl) {
      return NextResponse.json(
        { success: false, error: 'Please upload a logo file or provide a valid logo image URL.' },
        { status: 400 }
      );
    }

    const newPartner = await addPartner({
      name,
      logoUrl,
      websiteUrl,
      colorMode,
      active,
    });

    return NextResponse.json({ success: true, partner: newPartner }, { status: 201 });
  } catch (error) {
    console.error('[Admin/Partners API] POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create partner.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/partners
 * Handles updating a partner, updating global settings, or reordering
 */
export async function PUT(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const contentType = request.headers.get('content-type') || '';
    
    // Check if multipart form data was sent (e.g. updating partner with a new logo file)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const id = sanitizeText(formData.get('id'));

      if (!id) {
        return NextResponse.json({ success: false, error: 'Partner ID is required.' }, { status: 400 });
      }

      const updates: any = {};
      if (formData.has('name')) updates.name = sanitizeText(formData.get('name'));
      if (formData.has('websiteUrl')) updates.websiteUrl = sanitizeUrl(formData.get('websiteUrl'));
      if (formData.has('colorMode')) updates.colorMode = formData.get('colorMode') || undefined;
      if (formData.has('active')) updates.active = formData.get('active') === 'true';

      const fileEntry = formData.get('file');
      const pastedUrl = sanitizeUrl(formData.get('logoUrl'));

      if (fileEntry instanceof File && fileEntry.size > 0) {
        if (!ALLOWED_MIME_TYPES.includes(fileEntry.type)) {
          return NextResponse.json(
            { success: false, error: 'Invalid file type. Please upload PNG, JPG, SVG, or WebP.' },
            { status: 400 }
          );
        }
        if (fileEntry.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            { success: false, error: 'File too large. Maximum size is 5MB.' },
            { status: 400 }
          );
        }
        const buffer = Buffer.from(await fileEntry.arrayBuffer());
        updates.logoUrl = `data:${fileEntry.type};base64,${buffer.toString('base64')}`;
      } else if (pastedUrl) {
        updates.logoUrl = pastedUrl;
      }

      const updated = await updatePartner(id, updates);
      if (!updated) {
        return NextResponse.json({ success: false, error: 'Partner not found.' }, { status: 404 });
      }

      return NextResponse.json({ success: true, partner: updated });
    }

    const body = await request.json();

    // 1. Action: Update global section settings
    if (body.action === 'update-settings' || body.settings) {
      const settingsPayload = body.settings || body;
      const updatedSettings = await updatePartnersSettings({
        enabled: typeof settingsPayload.enabled === 'boolean' ? settingsPayload.enabled : undefined,
        title: settingsPayload.title !== undefined ? sanitizeText(settingsPayload.title) : undefined,
        subtitle: settingsPayload.subtitle !== undefined ? sanitizeText(settingsPayload.subtitle) : undefined,
        colorMode: settingsPayload.colorMode || undefined,
        layout: settingsPayload.layout === 'marquee' ? 'marquee' : 'grid',
        backgroundStyle: settingsPayload.backgroundStyle || undefined,
      });

      return NextResponse.json({ success: true, settings: updatedSettings });
    }

    // 2. Action: Reorder partners
    if (body.action === 'reorder' && Array.isArray(body.orderedIds)) {
      const reordered = await reorderPartners(body.orderedIds);
      return NextResponse.json({ success: true, partners: reordered });
    }

    // 3. Action: Update specific partner
    const partnerId = body.id;
    if (!partnerId) {
      return NextResponse.json({ success: false, error: 'Partner ID is required.' }, { status: 400 });
    }

    const updates: any = {};
    if (body.name !== undefined) updates.name = sanitizeText(body.name);
    if (body.logoUrl !== undefined) updates.logoUrl = sanitizeUrl(body.logoUrl);
    if (body.websiteUrl !== undefined) updates.websiteUrl = sanitizeUrl(body.websiteUrl);
    if (body.colorMode !== undefined) updates.colorMode = body.colorMode;
    if (body.active !== undefined) updates.active = Boolean(body.active);
    if (body.order !== undefined) updates.order = Number(body.order);

    const updatedPartner = await updatePartner(partnerId, updates);
    if (!updatedPartner) {
      return NextResponse.json({ success: false, error: 'Partner not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, partner: updatedPartner });
  } catch (error) {
    console.error('[Admin/Partners API] PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update partner data.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/partners
 * Removes a partner logo by id
 */
export async function DELETE(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch (_) {}
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Partner ID is required.' },
        { status: 400 }
      );
    }

    const deleted = await deletePartner(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Partner not found or already deleted.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Partner logo deleted.' });
  } catch (error) {
    console.error('[Admin/Partners API] DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete partner.' },
      { status: 500 }
    );
  }
}
