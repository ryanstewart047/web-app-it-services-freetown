import { NextRequest, NextResponse } from 'next/server';
import {
  getOnDemandRequests,
  saveOnDemandRequest,
  updateOnDemandRequest,
  deleteOnDemandRequest,
  getOnDemandPros,
  getOnDemandPro,
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

      // Check account status
      if (pro.status === 'blocked') {
        return NextResponse.json(
          { success: false, error: 'Your account has been blocked by administration. Please contact BridgeTech support at 076210320 / 088294631.' },
          { status: 403, headers: NO_CACHE_HEADERS }
        );
      }

      if (pro.status === 'suspended') {
        return NextResponse.json(
          { success: false, error: 'Your account is temporarily suspended by administration. Please contact BridgeTech support at 076210320.' },
          { status: 403, headers: NO_CACHE_HEADERS }
        );
      }

      // Check if temporary PIN has expired
      if (pro.mustChangePassword && pro.tempPasswordExpiresAt) {
        if (new Date() > new Date(pro.tempPasswordExpiresAt)) {
          return NextResponse.json(
            {
              success: false,
              error: 'This temporary reset PIN has expired (valid for 24 hours). Please contact BridgeTech support (076210320) or use password recovery.',
              isExpiredPin: true,
            },
            { status: 401, headers: NO_CACHE_HEADERS }
          );
        }
      }

      // Check password if set
      if (pro.password && password && pro.password !== password.trim()) {
        return NextResponse.json(
          { success: false, error: 'Incorrect password. Please try again.' },
          { status: 401, headers: NO_CACHE_HEADERS }
        );
      }

      // If pro has a temporary PIN, force them to set a new permanent password on first login
      if (pro.mustChangePassword) {
        return NextResponse.json(
          {
            success: true,
            requiresPasswordChange: true,
            proId: pro.id,
            proName: pro.fullName,
            phone: pro.phone,
            message: 'Temporary PIN verified. You must set a new permanent password on your first login to access the dashboard.',
          },
          { headers: NO_CACHE_HEADERS }
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

    // ── 3b. Artisan First-Login: Change Temporary Password ────────────────────
    if (action === 'set_permanent_password') {
      const { proId, currentPassword, newPassword } = body;
      if (!proId || !newPassword?.trim()) {
        return NextResponse.json(
          { success: false, error: 'Artisan ID and new permanent password are required.' },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }

      if (newPassword.trim().length < 4) {
        return NextResponse.json(
          { success: false, error: 'New password must be at least 4 characters or digits.' },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }

      const pro = await getOnDemandPro(proId);
      if (!pro) {
        return NextResponse.json({ success: false, error: 'Artisan profile not found.' }, { status: 404, headers: NO_CACHE_HEADERS });
      }

      // If current password provided, verify it
      if (currentPassword && pro.password && pro.password !== currentPassword.trim()) {
        return NextResponse.json(
          { success: false, error: 'Current temporary PIN does not match.' },
          { status: 401, headers: NO_CACHE_HEADERS }
        );
      }

      // If temporary PIN has expired
      if (pro.tempPasswordExpiresAt && new Date() > new Date(pro.tempPasswordExpiresAt)) {
        return NextResponse.json(
          { success: false, error: 'Temporary PIN has expired. Please contact support or request a new reset code.' },
          { status: 401, headers: NO_CACHE_HEADERS }
        );
      }

      // Save new permanent password and clear temporary flags
      const updatedPro = await updateOnDemandPro(pro.id, {
        password: newPassword.trim(),
        mustChangePassword: false,
        tempPasswordExpiresAt: null as any,
        resetCode: undefined,
        resetCodeExpiresAt: undefined,
      });

      const allRequests = await getOnDemandRequests();
      const assignedJobs = allRequests.filter(r => r.assignedProId === pro.id);

      return NextResponse.json(
        {
          success: true,
          message: 'Permanent password saved successfully! You are now logged in.',
          pro: updatedPro,
          assignedJobs,
        },
        { headers: NO_CACHE_HEADERS }
      );
    }

    // ── 4. Request Password Reset Code (via WhatsApp or Email) ───────────────
    if (action === 'request_reset_code') {
      const { identifier, deliveryMethod } = body;
      if (!identifier?.trim()) {
        return NextResponse.json(
          { success: false, error: 'Phone number or email address is required.' },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }

      const allPros = await getOnDemandPros();
      const cleanInput = identifier.trim().toLowerCase().replace(/\s+/g, '');
      const pro = allPros.find(p => {
        const pPhone = p.phone.replace(/\s+/g, '');
        const pWa = (p.whatsapp || '').replace(/\s+/g, '');
        const pEmail = (p.email || '').toLowerCase().trim();
        return (
          pPhone === cleanInput ||
          pPhone.endsWith(cleanInput.slice(-8)) ||
          pWa === cleanInput ||
          pWa.endsWith(cleanInput.slice(-8)) ||
          pEmail === cleanInput ||
          p.id.toLowerCase() === cleanInput
        );
      });

      if (!pro) {
        return NextResponse.json(
          { success: false, error: 'No account found matching this phone number or email.' },
          { status: 404, headers: NO_CACHE_HEADERS }
        );
      }

      if (deliveryMethod === 'email' && (!pro.email || !pro.email.includes('@'))) {
        return NextResponse.json(
          { success: false, error: 'No email address is linked to this account. Please select WhatsApp recovery instead.' },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }

      // Generate 6-digit numeric reset code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

      await updateOnDemandPro(pro.id, {
        resetCode: code,
        resetCodeExpiresAt: expiresAt,
      });

      const waPhone = (pro.whatsapp || pro.phone).replace(/\D/g, '');
      const waMsg = encodeURIComponent(
        `BridgeTech Security Code: Your 6-digit password reset code is ${code}. It expires in 15 minutes. Enter this code on the reset page to set a new password.`
      );
      const whatsappUrl = `https://wa.me/${waPhone}?text=${waMsg}`;

      // Masked target for UI display
      let maskedTarget = '';
      if (deliveryMethod === 'email' && pro.email) {
        const [user, domain] = pro.email.split('@');
        maskedTarget = `${user.slice(0, 2)}***@${domain}`;
      } else {
        const phoneDigits = (pro.whatsapp || pro.phone).replace(/\s+/g, '');
        maskedTarget = `${phoneDigits.slice(0, 4)}****${phoneDigits.slice(-3)}`;
      }

      return NextResponse.json(
        {
          success: true,
          message: `Reset code generated successfully for ${maskedTarget}.`,
          deliveryMethod,
          target: maskedTarget,
          code, // Displayed in UI so applicant can immediately see and use it
          whatsappUrl: deliveryMethod === 'whatsapp' ? whatsappUrl : undefined,
          proId: pro.id,
        },
        { headers: NO_CACHE_HEADERS }
      );
    }

    // ── 5. Verify Reset Code & Set New Password ──────────────────────────────
    if (action === 'verify_reset_code') {
      const { identifier, code, newPassword } = body;
      if (!identifier?.trim() || !code?.trim() || !newPassword?.trim()) {
        return NextResponse.json(
          { success: false, error: 'Phone/email, 6-digit verification code, and new password are required.' },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }

      if (newPassword.trim().length < 4) {
        return NextResponse.json(
          { success: false, error: 'New password must be at least 4 characters/digits.' },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }

      const allPros = await getOnDemandPros();
      const cleanInput = identifier.trim().toLowerCase().replace(/\s+/g, '');
      const pro = allPros.find(p => {
        const pPhone = p.phone.replace(/\s+/g, '');
        const pWa = (p.whatsapp || '').replace(/\s+/g, '');
        const pEmail = (p.email || '').toLowerCase().trim();
        return (
          pPhone === cleanInput ||
          pPhone.endsWith(cleanInput.slice(-8)) ||
          pWa === cleanInput ||
          pWa.endsWith(cleanInput.slice(-8)) ||
          pEmail === cleanInput ||
          p.id.toLowerCase() === cleanInput
        );
      });

      if (!pro) {
        return NextResponse.json(
          { success: false, error: 'Account not found.' },
          { status: 404, headers: NO_CACHE_HEADERS }
        );
      }

      if (!pro.resetCode) {
        return NextResponse.json(
          { success: false, error: 'No active reset code found. Please request a new code.' },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }

      if (pro.resetCodeExpiresAt && new Date() > new Date(pro.resetCodeExpiresAt)) {
        return NextResponse.json(
          { success: false, error: 'The reset code has expired. Please request a new code.' },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }

      if (pro.resetCode.trim() !== code.trim()) {
        return NextResponse.json(
          { success: false, error: 'Incorrect 6-digit verification code. Please check and try again.' },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }

      // Update password and clear reset code
      const updatedPro = await updateOnDemandPro(pro.id, {
        password: newPassword.trim(),
        mustChangePassword: false,
        tempPasswordExpiresAt: null as any,
        resetCode: undefined,
        resetCodeExpiresAt: undefined,
      });

      // Fetch assigned jobs so artisan is logged in directly
      const allRequests = await getOnDemandRequests();
      const assignedJobs = allRequests.filter(r => r.assignedProId === pro.id);

      return NextResponse.json(
        {
          success: true,
          message: 'Password successfully updated! You are now signed in.',
          pro: updatedPro,
          assignedJobs,
        },
        { headers: NO_CACHE_HEADERS }
      );
    }

    // ── 6. Admin Reset Pro Password Directly ─────────────────────────────────
    if (action === 'admin_reset_password') {
      const { id, newPassword, expiryHours = 24 } = body;
      if (!id || !newPassword?.trim()) {
        return NextResponse.json(
          { success: false, error: 'Pro ID and new password are required.' },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }

      const tempExpiresAt = new Date(Date.now() + (Number(expiryHours) || 24) * 60 * 60 * 1000).toISOString();

      const updatedPro = await updateOnDemandPro(id, {
        password: newPassword.trim(),
        mustChangePassword: true,
        tempPasswordExpiresAt: tempExpiresAt,
        resetCode: undefined,
        resetCodeExpiresAt: undefined,
      });

      if (!updatedPro) {
        return NextResponse.json({ success: false, error: 'Pro not found.' }, { status: 404, headers: NO_CACHE_HEADERS });
      }

      return NextResponse.json(
        {
          success: true,
          message: `Temporary PIN for ${updatedPro.fullName} reset to ${newPassword.trim()}. It expires in ${expiryHours}h and must be changed on first login.`,
          pro: updatedPro,
          tempPasswordExpiresAt: tempExpiresAt,
          mustChangePassword: true,
        },
        { headers: NO_CACHE_HEADERS }
      );
    }

    // ── 7. Admin Update Pro (also allowed via POST for proxy safety) ──────────
    if (action === 'update_pro') {
      const { id, action: _action, ...updates } = body;
      if (!id) {
        return NextResponse.json({ success: false, error: 'Pro ID is required' }, { status: 400, headers: NO_CACHE_HEADERS });
      }
      if (updates.status && typeof updates.status === 'string') {
        updates.status = updates.status.trim() as any;
      }

      const updated = await updateOnDemandPro(id, updates);
      if (!updated) {
        return NextResponse.json({ success: false, error: 'Pro not found' }, { status: 404, headers: NO_CACHE_HEADERS });
      }

      return NextResponse.json({ success: true, pro: updated }, { headers: NO_CACHE_HEADERS });
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
      const { id, action: _action, ...updates } = body;
      if (!id) {
        return NextResponse.json({ success: false, error: 'Pro ID is required' }, { status: 400, headers: NO_CACHE_HEADERS });
      }
      if (updates.status && typeof updates.status === 'string') {
        updates.status = updates.status.trim() as any;
      }

      const updated = await updateOnDemandPro(id, updates);
      if (!updated) {
        return NextResponse.json({ success: false, error: 'Pro not found' }, { status: 404, headers: NO_CACHE_HEADERS });
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
