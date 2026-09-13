import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, setUserSession } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state") || "signup";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=Google authentication was cancelled.`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${origin}/api/auth/google/callback`;

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId || "",
        client_secret: clientSecret || "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.access_token) {
      return NextResponse.redirect(`${origin}/login?error=Failed to retrieve Google token.`);
    }

    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const googleUser = await userRes.json();
    const email = googleUser.email?.toLowerCase().trim();
    const name = googleUser.name || email.split("@")[0];
    const avatarUrl = googleUser.picture;

    if (!email) {
      return NextResponse.redirect(`${origin}/login?error=No email returned from Google.`);
    }

    let user = await db.user.findUnique({ where: { email } });
    if (!user) {
      const passwordHash = await hashPassword(`google-oauth-${Date.now()}`);
      user = await db.user.create({
        data: {
          email,
          name,
          avatarUrl,
          passwordHash,
          role: "READER",
          topics: [],
        },
      });
    }

    await setUserSession(user.id);

    if (state === "signup" || !user.topics || user.topics.length === 0) {
      return NextResponse.redirect(`${origin}/onboarding`);
    }

    return NextResponse.redirect(`${origin}/`);
  } catch (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(`${origin}/login?error=Google authentication error.`);
  }
}
