"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  language?: string;
  code: string;
}

export function CodeBlock({ language = "text", code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code", err);
    }
  };

  const displayLang = language.replace("language-", "").toUpperCase();

  return (
    <div className="relative my-6 rounded-2xl overflow-hidden bg-[#1E293B] border border-slate-700/60 shadow-lg text-slate-100 group">
      {/* Top Code Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0F172A] border-b border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-slate-400 font-semibold ml-2 uppercase tracking-wider text-[11px]">
            {displayLang || "CODE"}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-sans cursor-pointer active:scale-95"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="p-4 overflow-x-auto text-[14px] leading-relaxed font-mono selection:bg-blue-500/30">
        <pre className="!bg-transparent !p-0 !m-0">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
