"use client";

import React, { useState, useTransition } from "react";
import { X, ArrowRight, ShieldCheck } from "lucide-react";
import { continueWithGoogleAction } from "@/app/actions/auth-actions";

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSignUp?: boolean;
}

export function GoogleAuthModal({
  isOpen,
  onClose,
  isSignUp = true,
}: GoogleAuthModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid Google email address.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await continueWithGoogleAction(email, name, isSignUp);
      if (res?.error) {
        setError(res.error);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          {/* Official Google Logo */}
          <div className="flex justify-center mb-5">
            <svg className="w-8 h-8" viewBox="0 0 24 24">
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
          </div>

          <div className="text-center mb-6">
            <h3 className="text-xl font-medium text-stone-900">
              Sign in with Google
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Choose your Google account to continue to{" "}
              <span className="font-semibold text-stone-800">The Margin</span>
            </p>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="google-email"
                className="block text-xs font-medium text-stone-700 mb-1"
              >
                Google Email address
              </label>
              <input
                id="google-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-stone-900 outline-none transition-all placeholder:text-stone-400"
                autoFocus
              />
            </div>

            <div>
              <label
                htmlFor="google-name"
                className="block text-xs font-medium text-stone-700 mb-1"
              >
                Your Full Name
              </label>
              <input
                id="google-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chetan Yadav"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-stone-900 outline-none transition-all placeholder:text-stone-400"
              />
            </div>

            <div className="flex items-center gap-2 text-[11px] text-stone-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>To continue, Google will share your name and email with The Margin.</span>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || !email.trim()}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#1A73E8] hover:bg-[#1557B0] disabled:opacity-50 text-white text-xs font-medium transition-colors shadow-xs cursor-pointer"
              >
                <span>{isPending ? "Signing in..." : "Continue"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
