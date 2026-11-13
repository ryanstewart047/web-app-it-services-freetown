import { NextRequest, NextResponse } from 'next/server';
import {
  getOnDemandRequests,
  saveOnDemandRequest,
  updateOnDemandRequest,
  deleteOnDemandRequest,
  getOnDemandPros,
  saveOnDemandPro,
  updateOnDemandPro,
  deleteOnDemandPro,
  getOnDemandStats,
} from '@/lib/on-demand-storage';
import { captureEmailLead } from '@/lib/email-leads';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'requests') {
      const requests = await getOnDemandRequests();
      return NextResponse.json({ success: true, requests }, { headers: NO_CACHE_HEADERS });
    }

    if (type === 'pros') {
      const pros = await getOnDemandPros();
      return NextResponse.json({ success: true, pros }, { headers: NO_CACHE_HEADERS });
    }

    if (type === 'stats') {
      const stats = await getOnDemandStats();
      return NextResponse.json({ success: true, stats }, { headers: NO_CACHE_HEADERS });
    }

    const [requests, pros, stats] = await Promise.all([
      getOnDemandRequests(),
      getOnDemandPros(),
      getOnDemandStats(),
    ]);

    return NextResponse.json({
      success: true,
      requests,
      pros,
      stats,
    }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    console.error('Error fetching on-demand data:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch on-demand data' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    // ── 1. Customer Submits a Service Job Request ─────────────────────────────
    if (action === 'create_request') {
      const {
        category,
        categoryTitle,
        customerName,
        phone,
        whatsapp,
        email,
        locationArea,
        addressDetails,
        urgency,
        problemDescription,
        preferredDate,
        preferredTime,
      } = body;

      if (!customerName?.trim() || !phone?.trim() || !problemDescription?.trim()) {
        return NextResponse.json(
          { success: false, error: 'Customer name, phone number, and problem description are required.' },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }

      const created = await saveOnDemandRequest({
        category: category || 'other',
        categoryTitle: categoryTitle || 'Specialized Service',
        customerName: customerName.trim(),
        phone: phone.trim(),
        whatsapp: (whatsapp || phone).trim(),
        email: email?.trim() || undefined,
        locationArea: locationArea || 'Freetown',
        addressDetails: addressDetails?.trim() || '',
        urgency: urgency || '24h',
        problemDescription: problemDescription.trim(),
        preferredDate,
        preferredTime,
        status: 'pending',
        platformCommissionRate: 0.15, // 15% platform commission
        paymentStatus: 'pending',
      });

      // Capture email lead if email provided
      if (email && email.includes('@')) {
        try {
          await captureEmailLead({
            email: email.trim(),
            name: customerName.trim(),
            phone: phone.trim(),
            source: 'appointment',
          });
        } catch {}
      }

      return NextResponse.json(
        { success: true, request: created, trackingId: created.id },
        { status: 201, headers: NO_CACHE_HEADERS }
      );
    }

    // ── 2. Artisan / Pro Registration ─────────────────────────────────────────
    if (action === 'register_pro') {
      const {
        fullName,
        phone,
        password,
        whatsapp,
        email,
        address,
        mobileMoneyNumber,
        mobileMoneyProvider,
        primaryTrade,
        secondarySkills,
        yearsOfExperience,
        coverageAreas,
        nationalIdNumber,
        profilePhoto,
        idCardFrontPhoto,
        idCardBackPhoto,
        idCardPhoto,
        onboardingPaymentRef,
        bioOrWorkSummary,
      } = body;

      if (!fullName?.trim() || !phone?.trim() || !primaryTrade?.trim()) {
        return NextResponse.json(
          { success: false, error: 'Full name, phone number, and primary trade are required.' },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }

      if (!address?.trim()) {
        return NextResponse.json(
          { success: false, error: 'Residential / physical address in Freetown is required.' },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }

      const created = await saveOnDemandPro({
        fullName: fullName.trim(),
        phone: phone.trim(),
        password: password?.trim() || undefined,
        whatsapp: (whatsapp || phone).trim(),
        email: email?.trim() || undefined,
        address: address.trim(),
        mobileMoneyNumber: (mobileMoneyNumber || phone).trim(),
        mobileMoneyProvider: mobileMoneyProvider || 'orange',
        primaryTrade: primaryTrade.trim(),
        secondarySkills: secondarySkills?.trim() || undefined,
        yearsOfExperience: yearsOfExperience || 1,
        coverageAreas: Array.isArray(coverageAreas) && coverageAreas.length > 0 ? coverageAreas : ['Central Freetown'],
        nationalIdNumber: nationalIdNumber?.trim() || undefined,
        profilePhoto: profilePhoto || undefined,
        idCardFrontPhoto: idCardFrontPhoto || idCardPhoto || undefined,
        idCardBackPhoto: idCardBackPhoto || undefined,
        idCardPhoto: idCardFrontPhoto || idCardPhoto || undefined,
        onboardingFeeAmount: 30, // 30 Leones commitment fee
        onboardingFeeStatus: onboardingPaymentRef ? 'pending_verification' : 'unpaid',
        onboardingPaymentRef: onboardingPaymentRef?.trim() || undefined,
        status: 'pending_review',
        bioOrWorkSummary: bioOrWorkSummary?.trim() || undefined,
      });

      // Capture email lead if provided
      if (email && email.includes('@')) {
        try {
          await captureEmailLead({
            email: email.trim(),
            name: fullName.trim(),
            phone: phone.trim(),
            source: 'appointment',
          });
        } catch {}
      }

      return NextResponse.json(
        { success: true, pro: created, proId: created.id },
        { status: 201, headers: NO_CACHE_HEADERS }
      );
    }

    // ── 3. Artisan Sign In ───────────────────────────────────────────────────
    if (action === 'login_pro') {
      const { phone, password } = body;
      if (!phone?.trim()) {
        return NextResponse.json(
          { success: false, error: 'Phone number is required.' },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }

      const allPros = await getOnDemandPros();
      const cleanPhone = phone.trim().replace(/\s+/g, '');
      const pro = allPros.find(p => {
        const pPhone = p.phone.replace(/\s+/g, '');
        return pPhone === cleanPhone || pPhone.endsWith(cleanPhone.slice(-8)) || p.id.toLowerCase() === cleanPhone.toLowerCase();
      });

      if (!pro) {
        return NextResponse.json(
          { success: false, error: 'No artisan profile found with this phone number. Please register first.' },
          { status: 404, headers: NO_CACHE_HEADERS }
        );
      }

      // Check password if set
      if (pro.password && password && pro.password !== password.trim()) {
        return NextResponse.json(
          { success: false, error: 'Incorrect password. Please try again.' },
          { status: 401, headers: NO_CACHE_HEADERS }
        );
      }

      // Fetch assigned jobs
      const allRequests = await getOnDemandRequests();
      const assignedJobs = allRequests.filter(r => r.assignedProId === pro.id);

      return NextResponse.json(
        { success: true, pro, assignedJobs },
        { headers: NO_CACHE_HEADERS }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action specified' },
      { status: 400, headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error('Error in on-demand POST handler:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Operation failed' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    // ── Update Service Request ──────────────────────────────────────────────
    if (action === 'update_request') {
      const { id, ...updates } = body;
      if (!id) {
        return NextResponse.json({ success: false, error: 'Request ID is required' }, { status: 400 });
      }

      const updated = await updateOnDemandRequest(id, updates);
      if (!updated) {
        return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, request: updated }, { headers: NO_CACHE_HEADERS });
    }

    // ── Update Pro / Artisan Details & Fee Verification ─────────────────────
    if (action === 'update_pro') {
      const { id, ...updates } = body;
      if (!id) {
        return NextResponse.json({ success: false, error: 'Pro ID is required' }, { status: 400 });
      }

      const updated = await updateOnDemandPro(id, updates);
      if (!updated) {
        return NextResponse.json({ success: false, error: 'Pro not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, pro: updated }, { headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json({ success: false, error: 'Invalid action specified' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in on-demand PUT handler:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Update failed' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, id } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    if (action === 'delete_request') {
      const deleted = await deleteOnDemandRequest(id);
      return NextResponse.json({ success: deleted }, { headers: NO_CACHE_HEADERS });
    }

    if (action === 'delete_pro') {
      const deleted = await deleteOnDemandPro(id);
      return NextResponse.json({ success: deleted }, { headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in on-demand DELETE handler:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
