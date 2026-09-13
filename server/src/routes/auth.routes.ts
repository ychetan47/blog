import { Router, Request, Response } from 'express';
import { db } from '../lib/db.js';
import {
  getOAuthConfig,
  isGoogleOAuthConfigured,
  generateOAuthState,
  getGoogleAuthUrl,
  exchangeOAuthCode,
  getGoogleUserInfo,
  OAUTH_STATE_COOKIE,
} from '../lib/oauth.js';
import {
  createSession,
  destroySession,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
} from '../lib/session.js';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const authRouter = Router();

const STATE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 15 * 60 * 1000, // 15 minutes
  path: '/',
};

/**
 * GET /api/auth/google
 * Initiates Google OAuth 2.0 Web Server authorization flow
 * Spec: https://developers.google.com/identity/protocols/oauth2/web-server#creatingclient
 */
authRouter.get('/google', (req: Request, res: Response): void => {
  const { frontendUrl } = getOAuthConfig();

  if (!isGoogleOAuthConfigured()) {
    // If credentials are not yet set in .env, display a helpful dev setup page
    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>The Margin — Google OAuth 2.0 Setup</title>
        <style>
          body { font-family: -apple-system, system-ui, sans-serif; background: #F8F7F3; color: #211E1A; padding: 40px 20px; line-height: 1.6; }
          .container { max-width: 580px; margin: 0 auto; background: #fff; padding: 36px; border: 1px solid #DDD9D0; border-radius: 12px; }
          h2 { margin-top: 0; font-size: 22px; font-weight: 500; }
          code { background: #F3F1EB; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
          pre { background: #F3F1EB; padding: 14px; border-radius: 8px; font-size: 13px; overflow-x: auto; }
          .btn { display: inline-block; padding: 10px 20px; background: #211E1A; color: #F8F7F3; text-decoration: none; border-radius: 9999px; font-size: 13px; font-weight: 500; margin-top: 10px; cursor: pointer; border: none; }
          .btn-google { background: #1A73E8; }
          .form-group { margin: 16px 0; }
          input { width: 100%; box-sizing: border-box; padding: 10px 14px; border: 1px solid #DDD9D0; border-radius: 6px; font-size: 14px; margin-top: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Google OAuth 2.0 Configuration Required</h2>
          <p>To authenticate live with Google's authorization servers, set your credentials in <code>server/.env</code>:</p>
          <pre>GOOGLE_CLIENT_ID="your-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:5001/api/auth/google/callback"</pre>
          <p style="font-size: 13px; color: #716D65;">
            In Google Cloud Console under <strong>Authorized redirect URIs</strong>, add:<br>
            <code>http://localhost:5001/api/auth/google/callback</code>
          </p>

          <hr style="border: 0; border-top: 1px solid #DDD9D0; margin: 24px 0;">

          <h3>Local Development Sandbox Sign-In</h3>
          <p style="font-size: 14px; color: #716D65;">You can also sign in right now with any test account to test the session and onboarding flow:</p>
          <form method="POST" action="/api/auth/dev-login">
            <div class="form-group">
              <label style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #716D65;">Full Name</label>
              <input type="text" name="name" value="Chetan Yadav" required>
            </div>
            <div class="form-group">
              <label style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #716D65;">Google Email</label>
              <input type="email" name="email" value="chetan@example.com" required>
            </div>
            <button type="submit" class="btn btn-google">Continue to The Margin &rarr;</button>
          </form>
          <div style="margin-top: 20px;">
            <a href="${frontendUrl}" style="color: #716D65; font-size: 13px;">&larr; Back to Journal</a>
          </div>
        </div>
      </body>
      </html>
    `);
    return;
  }

  // Generate anti-CSRF state token
  const state = generateOAuthState();
  res.cookie(OAUTH_STATE_COOKIE, state, STATE_COOKIE_OPTIONS);

  // Redirect browser to Google Authorization endpoint
  const authUrl = getGoogleAuthUrl(state);
  res.redirect(authUrl);
});

/**
 * GET /api/auth/google/callback
 * Handles the redirect from Google with authorization code
 * Spec: https://developers.google.com/identity/protocols/oauth2/web-server#handlingresponse
 */
authRouter.get('/google/callback', async (req: Request, res: Response): Promise<void> => {
  const { frontendUrl } = getOAuthConfig();
  const { code, state, error } = req.query;

  if (error) {
    console.error('Google OAuth error:', error);
    res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(String(error))}`);
    return;
  }

  if (!code || typeof code !== 'string') {
    res.status(400).send('Authorization code missing from Google callback.');
    return;
  }

  // Verify anti-CSRF state token
  const storedState = req.cookies?.[OAUTH_STATE_COOKIE];
  if (!state || state !== storedState) {
    res.status(400).send('Invalid OAuth state. CSRF verification failed.');
    return;
  }

  try {
    // 1. Exchange authorization code for Google access_token & id_token
    const tokenData = await exchangeOAuthCode(code);

    // 2. Fetch user profile from Google UserInfo endpoint
    const profile = await getGoogleUserInfo(tokenData.access_token);

    // 3. Upsert user in PostgreSQL database via Prisma
    const user = await db.user.upsert({
      where: { email: profile.email },
      update: {
        googleId: profile.sub,
        name: profile.name || profile.email.split('@')[0],
        avatarUrl: profile.picture || null,
      },
      create: {
        googleId: profile.sub,
        email: profile.email,
        name: profile.name || profile.email.split('@')[0],
        avatarUrl: profile.picture || null,
        role: 'READER',
        topics: [],
      },
    });

    // 4. Create database Session in PostgreSQL
    const sessionToken = await createSession(user.id, {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
    });

    // 5. Set session cookie and clear state cookie
    res.cookie(SESSION_COOKIE_NAME, sessionToken, SESSION_COOKIE_OPTIONS);
    res.clearCookie(OAUTH_STATE_COOKIE, { path: '/' });

    // 6. Redirect to onboarding if user has no topics, or to home
    if (!user.topics || user.topics.length === 0) {
      res.redirect(`${frontendUrl}/onboarding`);
    } else {
      res.redirect(`${frontendUrl}/`);
    }
  } catch (err: any) {
    console.error('Google OAuth callback failure:', err);
    res.redirect(
      `${frontendUrl}/login?error=${encodeURIComponent(
        err.message || 'Google authentication failed.'
      )}`
    );
  }
});

/**
 * POST /api/auth/dev-login
 * Development helper for local simulation
 */
authRouter.post('/dev-login', async (req: Request, res: Response): Promise<void> => {
  const { frontendUrl } = getOAuthConfig();
  const { email, name } = req.body;

  if (!email || !name) {
    res.status(400).json({ error: 'Name and email are required.' });
    return;
  }

  try {
    const user = await db.user.upsert({
      where: { email },
      update: { name },
      create: {
        email,
        name,
        role: 'READER',
        topics: [],
        avatarUrl:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
    });

    const sessionToken = await createSession(user.id);
    res.cookie(SESSION_COOKIE_NAME, sessionToken, SESSION_COOKIE_OPTIONS);

    if (req.headers.accept?.includes('text/html') || req.headers['content-type']?.includes('form')) {
      if (!user.topics || user.topics.length === 0) {
        res.redirect(`${frontendUrl}/onboarding`);
      } else {
        res.redirect(`${frontendUrl}/`);
      }
    } else {
      res.json({ user, sessionToken });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Development sign-in failed.' });
  }
});

/**
 * POST /api/auth/logout
 * Destroys session in database and clears cookie
 */
authRouter.post('/logout', async (req: Request, res: Response): Promise<void> => {
  const sessionToken = req.cookies?.[SESSION_COOKIE_NAME];
  if (sessionToken) {
    await destroySession(sessionToken);
  }
  res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
  res.json({ success: true, message: 'Signed out successfully.' });
});

/**
 * GET /api/auth/me
 * Validates session against database and returns active user profile
 */
authRouter.get(
  '/me',
  optionalAuth,
  (req: AuthenticatedRequest, res: Response): void => {
    res.json({ user: req.user || null });
  }
);

export default authRouter;
