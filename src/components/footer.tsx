import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-[#DDD9D0] mt-24 sm:mt-36 py-12 sm:py-16 text-[#716D65] text-xs sm:text-sm">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-12 lg:px-16 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <p className="font-normal text-[#716D65]">
          The Margin — an independent journal about reading, craft, and quiet software.
        </p>

        <div className="flex items-center gap-6 sm:gap-8 text-xs text-[#8A867E]">
          <Link href="/stories" className="hover:text-[#211E1A] transition-colors">
            Stories
          </Link>
          <Link href="/library" className="hover:text-[#211E1A] transition-colors">
            Saved
          </Link>
          <Link href="/onboarding" className="hover:text-[#211E1A] transition-colors">
            Topics
          </Link>
          <Link href="/login" className="hover:text-[#211E1A] transition-colors">
            Account
          </Link>
        </div>
      </div>
    </footer>
  );
}
