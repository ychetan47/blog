import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth-actions";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const sessionUser = await getUserSession();
  if (!sessionUser) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      _count: {
        select: {
          savedStories: true,
          posts: true,
          claps: true,
        },
      },
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="w-full min-h-screen bg-[#F8F7F3] pb-28 sm:pb-36">
      <div className="max-w-[760px] mx-auto px-6 pt-12 sm:pt-20">
        {/* Profile Card */}
        <div className="bg-[#F3F1EB] rounded-[10px] border border-[#DDD9D0] p-8 sm:p-10 mb-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-16 h-16 rounded-full bg-[#E5E1D8] border border-[#DDD9D0] flex items-center justify-center font-editorial text-2xl text-[#211E1A] shrink-0">
              {user.name.charAt(0)}
            </div>

            <div className="text-center sm:text-left flex-1">
              <h1 className="font-editorial text-3xl sm:text-4xl text-[#211E1A] font-normal tracking-tight">
                {user.name}
              </h1>
              <p className="text-xs text-[#8A867E] mt-1 font-mono">{user.email}</p>
              {user.bio && (
                <p className="text-sm sm:text-base text-[#716D65] mt-3 leading-relaxed">
                  {user.bio}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center justify-center sm:justify-start gap-8 mt-6 pt-5 border-t border-[#DDD9D0] text-xs text-[#716D65]">
                <div>
                  <span className="text-[#211E1A] font-medium">{user._count.savedStories}</span>{" "}
                  Saved
                </div>
                <div>
                  <span className="text-[#211E1A] font-medium">{user._count.posts}</span> Stories
                </div>
                <div>
                  <span className="text-[#211E1A] font-medium">{user.topics.length}</span> Topics
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reading Interests Section */}
        <div className="bg-[#F3F1EB] rounded-[10px] border border-[#DDD9D0] p-8 sm:p-10 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#DDD9D0]">
            <div>
              <h2 className="font-editorial text-2xl text-[#211E1A] font-normal">
                Reading Interests
              </h2>
              <p className="text-xs text-[#716D65] mt-1">
                Your home feed is curated based on these topics.
              </p>
            </div>

            <Link
              href="/onboarding"
              className="px-4 py-1.5 rounded-full border border-[#DDD9D0] hover:border-[#8A867E] text-[#211E1A] text-xs font-medium transition-colors"
            >
              Edit topics
            </Link>
          </div>

          {user.topics.length === 0 ? (
            <div className="py-8 text-center text-[#8A867E]">
              <p className="text-sm">You haven&apos;t chosen any topics yet.</p>
              <Link
                href="/onboarding"
                className="inline-block mt-4 px-6 py-2 bg-[#211E1A] text-[#F8F7F3] text-xs font-medium rounded-full"
              >
                Choose reading topics
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 pt-2">
              {user.topics.map((topic) => (
                <span
                  key={topic}
                  className="px-4 py-1.5 rounded-full bg-transparent text-[#211E1A] text-xs font-normal border border-[#DDD9D0]"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Account Controls */}
        <div className="mt-10 flex justify-end">
          <form action={logoutAction}>
            <button
              type="submit"
              className="px-5 py-2 rounded-full border border-[#DDD9D0] text-[#716D65] hover:text-[#211E1A] hover:border-[#8A867E] text-xs font-medium transition-colors cursor-pointer"
            >
              Sign out of The Margin
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
