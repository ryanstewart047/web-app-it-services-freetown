/**
 * Official PayPal REST API v2 Server Integration
 * Supports both Live and Sandbox environments
 */

const PAYPAL_MODE = process.env.PAYPAL_MODE || 'live';
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';

const PAYPAL_BASE_URL =
  PAYPAL_MODE === 'sandbox'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

/**
 * Obtain an OAuth2 Access Token from PayPal REST API
 */
export async function getPayPalAccessToken(): Promise<string> {
  const clientId = PAYPAL_CLIENT_ID.trim();
  const secret = PAYPAL_CLIENT_SECRET.trim();

  if (!clientId || !secret) {
    throw new Error('PayPal API credentials are not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.');
  }

  // Use cached token if valid
  if (cachedAccessToken && Date.now() < cachedAccessToken.expiresAt) {
    return cachedAccessToken.token;
  }

  const basicAuth = Buffer.from(`${clientId}:${secret}`).toString('base64');

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[PayPal API] Token generation failed:', errorText);
    throw new Error(`Failed to authenticate with PayPal: ${response.statusText}`);
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };
  
  // Cache token (expires_in is in seconds, refresh 60s early)
  cachedAccessToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return data.access_token;
}

export interface CreateOrderParams {
  amount: string; // e.g. "1.25"
  currency?: string; // default "USD"
  description?: string;
  referenceId?: string; // code or order ID
  customerEmail?: string;
}

/**
 * Create an order using PayPal Orders v2 REST API
 */
export async function createPayPalOrder(params: CreateOrderParams): Promise<{ id: string; status: string }> {
  const token = await getPayPalAccessToken();

  const body = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: params.referenceId || 'BRIDGE-ORDER',
        description: params.description || 'BridgeTec Digital Purchase',
        amount: {
          currency_code: params.currency || 'USD',
          value: params.amount,
        },
      },
    ],
    application_context: {
      brand_name: 'BridgeTec Digital',
      landing_page: 'NO_PREFERENCE',
      user_action: 'PAY_NOW',
      shipping_preference: 'NO_SHIPPING',
    },
  };

  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('[PayPal API] Order creation error:', data);
    throw new Error(data.message || 'Failed to create PayPal order.');
  }

  return { id: data.id, status: data.status };
}

/**
 * Capture payment for a created PayPal order
 */
export async function capturePayPalOrder(orderId: string): Promise<{
  id: string;
  status: string;
  payer?: { email_address?: string; name?: { given_name?: string; surname?: string } };
  captureId?: string;
  amount?: { currency_code: string; value: string };
}> {
  const token = await getPayPalAccessToken();

  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    cache: 'no-store',
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('[PayPal API] Capture order error:', data);
    throw new Error(data.message || 'Failed to capture PayPal payment.');
  }

  const capture = data.purchase_units?.[0]?.payments?.captures?.[0];

  return {
    id: data.id,
    status: data.status,
    payer: data.payer,
    captureId: capture?.id,
    amount: capture?.amount,
  };
}

/**
 * Get public PayPal Client ID for frontend SDK initialization
 */
export function getPublicPayPalClientId(): string {
  return PAYPAL_CLIENT_ID.trim();
}
