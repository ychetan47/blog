"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions/auth-actions";

interface NavbarProps {
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    topics?: string[];
    _count?: {
      savedStories: number;
    };
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F8F7F3]/95 backdrop-blur-xs border-b border-[#DDD9D0] transition-colors">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-12 lg:px-16 h-20 sm:h-24 flex items-center justify-between">
        {/* Left: Publication Masthead (The Margin) */}
        <Link href="/" className="group inline-block">
          <span className="font-editorial text-3xl sm:text-4xl text-[#211E1A] font-normal tracking-tight group-hover:text-[#716D65] transition-colors">
            The Margin
          </span>
        </Link>

        {/* Desktop Minimal Navigation: Stories · Saved · Sign in / Profile */}
        <nav className="hidden sm:flex items-center gap-8 sm:gap-12 text-[15px] sm:text-[16px] font-normal text-[#716D65]">
          <Link
            href="/stories"
            className={`transition-colors hover:text-[#211E1A] ${
              pathname.startsWith("/stories") ? "text-[#211E1A]" : ""
            }`}
          >
            Stories
          </Link>

          <Link
            href="/library"
            className={`transition-colors hover:text-[#211E1A] ${
              pathname.startsWith("/library") ? "text-[#211E1A]" : ""
            }`}
          >
            Saved
          </Link>

          {user ? (
            <div className="flex items-center gap-6">
              <Link
                href="/profile"
                className={`transition-colors hover:text-[#211E1A] ${
                  pathname.startsWith("/profile") ? "text-[#211E1A]" : ""
                }`}
              >
                Profile
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="text-xs text-[#8A867E] hover:text-[#211E1A] transition-colors cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className={`transition-colors hover:text-[#211E1A] ${
                pathname === "/login" ? "text-[#211E1A]" : ""
              }`}
            >
              Sign in
            </Link>
          )}
        </nav>

        {/* Mobile menu button */}
        <div className="sm:hidden flex items-center gap-4">
          <Link
            href="/library"
            className="text-xs uppercase tracking-wider text-[#716D65]"
          >
            Saved
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-[#211E1A] cursor-pointer"
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer - Plain text navigation matching Screenshot 1 */}
      {menuOpen && (
        <div className="sm:hidden bg-[#F8F7F3] border-b border-[#DDD9D0] px-8 py-8 space-y-7 animate-in fade-in duration-200">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className={`block text-2xl font-normal transition-colors ${
              pathname === "/" ? "text-[#211E1A]" : "text-[#716D65]"
            }`}
          >
            Home
          </Link>
          <Link
            href="/library"
            onClick={() => setMenuOpen(false)}
            className={`block text-2xl font-normal transition-colors ${
              pathname.startsWith("/library") ? "text-[#211E1A]" : "text-[#716D65]"
            }`}
          >
            Library
          </Link>
          <Link
            href={user ? "/profile" : "/login"}
            onClick={() => setMenuOpen(false)}
            className={`block text-2xl font-normal transition-colors ${
              pathname.startsWith("/profile") || pathname === "/login"
                ? "text-[#211E1A]"
                : "text-[#716D65]"
            }`}
          >
            {user ? "Profile" : "Sign in"}
          </Link>
          <Link
            href="/stories"
            onClick={() => setMenuOpen(false)}
            className={`block text-2xl font-normal transition-colors ${
              pathname.startsWith("/stories") ? "text-[#211E1A]" : "text-[#716D65]"
            }`}
          >
            Stories
          </Link>
          <Link
            href="/onboarding"
            onClick={() => setMenuOpen(false)}
            className={`block text-2xl font-normal transition-colors ${
              pathname.startsWith("/onboarding") ? "text-[#211E1A]" : "text-[#716D65]"
            }`}
          >
            Topics
          </Link>

          {user && (
            <form action={logoutAction} className="pt-4 border-t border-[#DDD9D0]">
              <button
                type="submit"
                className="text-sm text-[#716D65] hover:text-[#211E1A] cursor-pointer"
              >
                Sign out
              </button>
            </form>
          )}
        </div>
      )}
    </header>
  );
}
