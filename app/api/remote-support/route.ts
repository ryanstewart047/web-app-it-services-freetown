import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, sanitizeText } from '@/lib/admin-guard';

const VALID_STATUSES = ['new', 'scheduled', 'in_progress', 'waiting_for_client', 'resolved', 'cancelled'];

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const requests = await prisma.remoteSupportRequest.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(requests);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const customerName = sanitizeText(body.customerName);
    const email = sanitizeText(body.email).toLowerCase();
    const phone = sanitizeText(body.phone);
    const deviceType = sanitizeText(body.deviceType);
    const service = sanitizeText(body.service);
    const issueDescription = sanitizeText(body.issueDescription);

    if (!customerName || !/^\S+@\S+\.\S+$/.test(email) || !phone || !deviceType || !service || issueDescription.length < 10 || body.consentAccepted !== true) {
      return NextResponse.json({ error: 'Please complete all required fields and accept the remote-access consent.' }, { status: 400 });
    }

    const supportRequest = await prisma.remoteSupportRequest.create({
      data: {
        customerName, email, phone, deviceType, service, issueDescription,
        deviceModel: sanitizeText(body.deviceModel) || null,
        preferredTime: sanitizeText(body.preferredTime) || null,
        paymentMethod: sanitizeText(body.paymentMethod) || null,
        consentAccepted: true,
      },
    });

    return NextResponse.json(supportRequest, { status: 201 });
  } catch (error) {
    console.error('Unable to create remote support request:', error);
    return NextResponse.json({ error: 'Unable to submit your support request. Please try again or contact us on WhatsApp.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'Request ID is required.' }, { status: 400 });
  if (body.status && !VALID_STATUSES.includes(body.status)) return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });

  const updated = await prisma.remoteSupportRequest.update({
    where: { id: body.id },
    data: {
      ...(body.status ? { status: body.status } : {}),
      ...(body.technicianNotes !== undefined ? { technicianNotes: sanitizeText(body.technicianNotes) || null } : {}),
      ...(body.sessionReference !== undefined ? { sessionReference: sanitizeText(body.sessionReference) || null } : {}),
    },
  });
  return NextResponse.json(updated);
}
