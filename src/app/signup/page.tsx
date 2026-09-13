"use client";

import React, { useState, useActionState } from "react";
import Link from "next/link";
import { signUpAction } from "@/app/actions/auth-actions";
import { GoogleAuthModal } from "@/components/google-auth-modal";

export default function SignUpPage() {
  const [state, formAction, isPending] = useActionState(signUpAction, null);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const handleGoogleClick = () => {
    // If external Google OAuth is configured, redirect to it; otherwise open Google Account dialog
    setShowGoogleModal(true);
  };

  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex flex-col items-center justify-center px-6 py-16 sm:py-24 bg-[#F8F7F3]">
      <div className="text-center max-w-md mx-auto mb-10">
        <h1 className="font-editorial text-4xl sm:text-5xl text-[#211E1A] font-normal tracking-tight leading-none">
          Join The Margin
        </h1>
        <p className="text-base text-[#716D65] mt-4 font-normal">
          Essays on typography, attention and the craft of making things worth finishing.
        </p>
      </div>

      <div className="w-full max-w-md bg-[#F3F1EB] rounded-[10px] border border-[#DDD9D0] p-8 sm:p-10">
        {/* Continue with Google */}
        <button
          type="button"
          onClick={handleGoogleClick}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-full border border-[#DDD9D0] hover:border-[#8A867E] bg-transparent text-[#211E1A] text-xs sm:text-sm font-medium transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.33 24 12 24Z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15Z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* OR Divider */}
        <div className="relative flex items-center justify-center my-6">
          <div className="border-t border-[#DDD9D0] w-full" />
          <span className="bg-[#F3F1EB] px-3 text-[11px] font-normal tracking-[0.18em] text-[#8A867E] uppercase">
            or
          </span>
          <div className="border-t border-[#DDD9D0] w-full" />
        </div>

        {state?.error && (
          <div className="p-3 mb-5 rounded-[8px] bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label
              htmlFor="signup-name"
              className="block text-[11px] font-normal uppercase tracking-[0.18em] text-[#716D65] mb-2"
            >
              Full Name
            </label>
            <input
              id="signup-name"
              type="text"
              name="name"
              required
              placeholder="e.g. Alex Morgan"
              className="w-full px-4 py-2.5 bg-[#F8F7F3] border border-[#DDD9D0] focus:border-[#211E1A] rounded-[8px] text-sm text-[#211E1A] outline-none transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="signup-email"
              className="block text-[11px] font-normal uppercase tracking-[0.18em] text-[#716D65] mb-2"
            >
              Email Address
            </label>
            <input
              id="signup-email"
              type="email"
              name="email"
              required
              placeholder="alex@example.com"
              className="w-full px-4 py-2.5 bg-[#F8F7F3] border border-[#DDD9D0] focus:border-[#211E1A] rounded-[8px] text-sm text-[#211E1A] outline-none transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="signup-password"
              className="block text-[11px] font-normal uppercase tracking-[0.18em] text-[#716D65] mb-2"
            >
              Create Password
            </label>
            <input
              id="signup-password"
              type="password"
              name="password"
              required
              placeholder="At least 6 characters"
              className="w-full px-4 py-2.5 bg-[#F8F7F3] border border-[#DDD9D0] focus:border-[#211E1A] rounded-[8px] text-sm text-[#211E1A] outline-none transition-colors"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 px-4 bg-[#211E1A] hover:bg-stone-800 text-[#F8F7F3] font-medium text-sm rounded-full transition-colors cursor-pointer disabled:opacity-50"
            >
              {isPending ? "Creating account..." : "Continue to Choose Topics"}
            </button>
          </div>
        </form>

        <div className="text-center mt-8 pt-4 border-t border-[#DDD9D0] text-xs text-[#716D65]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="underline underline-offset-2 hover:text-[#211E1A] transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* Google Auth Interactive Dialog */}
      <GoogleAuthModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        isSignUp={true}
      />
    </div>
  );
}
