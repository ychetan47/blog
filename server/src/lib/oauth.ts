import crypto from 'crypto';

export interface GoogleUserInfo {
  sub: string; // Google's unique user ID
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email: string;
  email_verified?: boolean;
}

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token?: string;
  refresh_token?: string;
}

export const OAUTH_STATE_COOKIE = 'themargin_oauth_state';

/**
 * Returns Google OAuth configuration from environment
 */
export function getOAuthConfig() {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl:
      process.env.GOOGLE_CALLBACK_URL ||
      'http://localhost:5001/api/auth/google/callback',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  };
}

/**
 * Checks if live Google OAuth credentials are configured
 */
export function isGoogleOAuthConfigured(): boolean {
  const { clientId, clientSecret } = getOAuthConfig();
  return Boolean(
    clientId &&
      clientSecret &&
      !clientId.includes('your-client-id') &&
      !clientSecret.includes('your-client-secret')
  );
}

/**
 * Generates a random cryptographic state token to protect against CSRF
 */
export function generateOAuthState(): string {
  return crypto.randomBytes(24).toString('hex');
}

/**
 * Builds Google OAuth 2.0 Authorization URL
 * Spec: https://developers.google.com/identity/protocols/oauth2/web-server#creatingclient
 */
export function getGoogleAuthUrl(state: string): string {
  const { clientId, callbackUrl } = getOAuthConfig();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchanges authorization code for Google access_token & id_token
 * Spec: https://developers.google.com/identity/protocols/oauth2/web-server#exchange-authorization-code
 */
export async function exchangeOAuthCode(code: string): Promise<GoogleTokenResponse> {
  const { clientId, clientSecret, callbackUrl } = getOAuthConfig();

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: callbackUrl,
    grant_type: 'authorization_code',
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  const data: any = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error_description || data.error || 'Failed to exchange Google OAuth code.'
    );
  }

  return data as GoogleTokenResponse;
}

/**
 * Fetches user profile from Google's UserInfo endpoint
 */
export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error('Failed to retrieve user info from Google.');
  }

  return data as GoogleUserInfo;
}
