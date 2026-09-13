import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const mode = searchParams.get("mode") || "signup";

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    // If client ID is not configured in .env, redirect to mode page with query flag to open modal
    return NextResponse.redirect(`${origin}/${mode}?googleAuth=prompt`);
  }

  const redirectUri = `${origin}/api/auth/google/callback`;
  const state = mode;
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=openid%20email%20profile&state=${state}&prompt=select_account`;

  return NextResponse.redirect(googleAuthUrl);
}
