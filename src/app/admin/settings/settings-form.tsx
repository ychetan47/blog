"use client";

import React, { useActionState } from "react";
import { updateSettingsAction } from "../actions";
import { Save, Check } from "lucide-react";

interface SettingsFormProps {
  settings: {
    heroTitle?: string;
    heroSubtitle?: string;
    authorName?: string;
    authorBio?: string;
    avatarUrl?: string;
    githubUrl?: string;
    twitterUrl?: string;
    linkedinUrl?: string;
  } | null;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const [state, formAction, isPending] = useActionState(updateSettingsAction, null);

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      {state?.success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {state?.error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {state.error}
        </div>
      )}

      {/* Hero & Branding */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Homepage Hero & Header
        </h2>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Hero Main Headline
          </label>
          <input
            type="text"
            name="heroTitle"
            defaultValue={settings?.heroTitle || "Thoughts, Engineering & Everything In Between"}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Hero Subtitle / Description
          </label>
          <textarea
            name="heroSubtitle"
            rows={3}
            defaultValue={
              settings?.heroSubtitle ||
              "Writing about software engineering, backend systems, technology, productivity, and things I learn along the way."
            }
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white outline-none resize-none"
          />
        </div>
      </div>

      {/* Author Profile */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Author Bio & Profile
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Author Display Name
            </label>
            <input
              type="text"
              name="authorName"
              defaultValue={settings?.authorName || "Chetan Yadav"}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Avatar Image URL
            </label>
            <input
              type="url"
              name="avatarUrl"
              defaultValue={
                settings?.avatarUrl ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              }
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Author Bio
          </label>
          <textarea
            name="authorBio"
            rows={3}
            defaultValue={
              settings?.authorBio ||
              "Senior Software Engineer crafting high-scale distributed systems, event-driven architectures, and modern web applications."
            }
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white outline-none resize-none"
          />
        </div>
      </div>

      {/* Social Handles */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Social Profiles
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              GitHub URL
            </label>
            <input
              type="url"
              name="githubUrl"
              defaultValue={settings?.githubUrl || "https://github.com"}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Twitter / X URL
            </label>
            <input
              type="url"
              name="twitterUrl"
              defaultValue={settings?.twitterUrl || "https://twitter.com"}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              LinkedIn URL
            </label>
            <input
              type="url"
              name="linkedinUrl"
              defaultValue={settings?.linkedinUrl || "https://linkedin.com"}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs rounded-2xl shadow-sm transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{isPending ? "Saving Settings..." : "Save Settings"}</span>
        </button>
      </div>
    </form>
  );
}
