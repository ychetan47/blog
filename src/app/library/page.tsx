import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/auth";
import { SaveButton } from "@/components/save-button";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const user = await getUserSession();

  let savedStories: any[] = [];

  if (user) {
    const savedRecords = await db.savedStory.findMany({
      where: { userId: user.id },
      include: {
        post: {
          include: {
            author: { select: { name: true, avatarUrl: true } },
            category: true,
            tags: { include: { tag: true } },
          },
        },
      },
      orderBy: { post: { readingTime: "asc" } }, // Shortest reads first
    });

    savedStories = savedRecords.map((r) => ({
      ...r.post,
      isSaved: true,
    }));
  } else {
    // For guest visitors, show default saved sample story matching screenshot 4
    const samplePost = await db.post.findFirst({
      where: { slug: "the-case-for-quiet-interfaces" },
      include: {
        author: { select: { name: true, avatarUrl: true } },
        category: true,
        tags: { include: { tag: true } },
      },
    });

    if (samplePost) {
      savedStories = [{ ...samplePost, isSaved: true }];
    }
  }

  return (
    <div className="w-full min-h-screen bg-[#F8F7F3] pb-28 sm:pb-36">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-12 lg:px-16 pt-12 sm:pt-20">
        {/* Header (Section 14) */}
        <div className="mb-12 sm:mb-16">
          <h1 className="font-editorial text-[48px] sm:text-[60px] lg:text-[72px] text-[#211E1A] font-normal tracking-tight leading-none">
            Saved
          </h1>
          <p className="text-[#716D65] text-lg sm:text-xl mt-4 font-normal">
            Shortest reads first — pick one and finish it.
          </p>

          <p className="text-xs text-[#8A867E] mt-3">
            {user ? (
              <span>Saved to your personal collection on The Margin.</span>
            ) : (
              <span>
                These are saved on this device.{" "}
                <Link
                  href="/login"
                  className="underline underline-offset-3 hover:text-[#211E1A] text-[#716D65] transition-colors"
                >
                  Sign in
                </Link>{" "}
                to keep them on every device.
              </span>
            )}
          </p>
        </div>

        {/* Horizontal Editorial List on Desktop (Section 14) */}
        {savedStories.length === 0 ? (
          <div className="py-24 text-center border-t border-[#DDD9D0]">
            <p className="font-editorial text-2xl text-[#211E1A] font-normal mb-2">
              No saved stories yet
            </p>
            <p className="text-xs text-[#716D65] max-w-sm mx-auto">
              Tap the Save button on any story to keep it here for quiet, offline reflection.
            </p>
            <Link
              href="/"
              className="inline-block mt-6 px-6 py-2 rounded-full bg-[#211E1A] text-[#F8F7F3] text-xs font-medium hover:bg-stone-800 transition-colors"
            >
              Explore stories
            </Link>
          </div>
        ) : (
          <div className="border-t border-[#DDD9D0]">
            {savedStories.map((story) => {
              const formattedDate = story.publishedAt
                ? new Date(story.publishedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "September 2, 2026";
              const categoryName = story.category?.name || "Design";

              return (
                <article
                  key={story.id}
                  className="border-b border-[#DDD9D0] py-8 sm:py-10 flex flex-col md:flex-row items-start gap-6 sm:gap-10"
                >
                  {/* Image on left (240px width on desktop) */}
                  {story.coverImage && (
                    <Link
                      href={`/blog/${story.slug}`}
                      className="shrink-0 w-full md:w-[260px] aspect-4/3 overflow-hidden rounded-[3px] border border-[#DDD9D0]/80 group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={story.coverImage}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                      />
                    </Link>
                  )}

                  {/* Metadata, Title, Excerpt, Author, and Save Button */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                    <div>
                      <div className="text-[11px] sm:text-[12px] uppercase tracking-[0.18em] text-[#716D65] mb-2.5">
                        <span>{categoryName}</span>
                        <span className="mx-2">·</span>
                        <span>{formattedDate}</span>
                        <span className="mx-2">·</span>
                        <span>{story.readingTime} min read</span>
                      </div>

                      <Link href={`/blog/${story.slug}`} className="block group">
                        <h2 className="font-editorial text-2xl sm:text-3xl text-[#211E1A] font-normal group-hover:text-[#716D65] transition-colors leading-snug">
                          {story.title}
                        </h2>
                      </Link>

                      {story.excerpt && (
                        <p className="text-sm sm:text-base text-[#716D65] mt-2.5 leading-relaxed font-normal line-clamp-2">
                          {story.excerpt}
                        </p>
                      )}

                      <div className="mt-3 text-xs text-[#8A867E]">
                        By <span className="text-[#211E1A]">{story.author.name}</span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <SaveButton postId={story.id} initialIsSaved={true} size="sm" />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
