"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "../actions";
import { ShieldCheck, Lock, Mail, ArrowRight, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#ebf2fd]">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-slate-100">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Public Blog</span>
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-3 shadow-2xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Author Admin Login
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sign in to manage articles, categories, and site settings.
          </p>
        </div>

        {state?.error && (
          <div className="p-3.5 mb-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                required
                defaultValue="admin@example.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                name="password"
                required
                defaultValue="admin123"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-slate-900 hover:bg-blue-600 text-white font-bold text-sm rounded-2xl shadow-sm transition-all disabled:opacity-50 cursor-pointer active:scale-98"
            >
              <span>{isPending ? "Authenticating..." : "Sign In to Dashboard"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="mt-6 p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-center">
          <p className="text-[11px] font-medium text-blue-800">
            Demo Credentials Pre-filled: <span className="font-bold">admin@example.com</span> / <span className="font-bold">admin123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
