import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/auth";
import { MarkdownView } from "@/components/markdown-view";
import { SaveButton } from "@/components/save-button";
import { AuthorCard } from "@/components/author-card";
import { KeepReading } from "@/components/keep-reading";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogDetailPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const user = await getUserSession();

  const post = await db.post.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: { include: { tag: true } },
      author: true,
      comments: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      ...(user
        ? {
            savedBy: {
              where: { userId: user.id },
              select: { id: true },
            },
          }
        : {}),
    },
  });

  if (!post || !post.published) {
    notFound();
  }

  // Increment views quietly
  try {
    await db.post.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    });
  } catch {
    // ignore
  }

  // Fetch next reads for KEEP READING section
  const relatedPosts = await db.post.findMany({
    where: {
      id: { not: post.id },
      published: true,
    },
    take: 3,
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      readingTime: true,
    },
  });

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "September 2, 2026";

  const isSaved = Boolean(post.savedBy && post.savedBy.length > 0);
  const categoryName = post.category?.name || "Design";

  return (
    <div className="w-full min-h-screen bg-[#F8F7F3] pb-28 sm:pb-36">
      {/* Editorial Reading Container: 680–760px (max-w-[720px]) */}
      <div className="max-w-[720px] mx-auto px-6 sm:px-8 pt-10 sm:pt-16">
        {/* At top: ← All stories */}
        <div className="mb-10 sm:mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#716D65] hover:text-[#211E1A] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All stories</span>
          </Link>
        </div>

        {/* Story Metadata */}
        <div className="text-[12px] uppercase tracking-[0.18em] text-[#716D65] mb-4">
          <span>{categoryName}</span>
          <span className="mx-2">·</span>
          <span>{formattedDate}</span>
          <span className="mx-2">·</span>
          <span>{post.readingTime} min read</span>
        </div>

        {/* Story Title: 48–64px desktop, 36–44px mobile, font-weight 400 */}
        <h1 className="font-editorial text-[36px] sm:text-[48px] lg:text-[56px] text-[#211E1A] font-normal leading-[1.08] tracking-tight">
          {post.title}
        </h1>

        {/* Story Excerpt / Subtitle */}
        {post.excerpt && (
          <p className="text-[#716D65] text-lg sm:text-xl lg:text-[22px] leading-relaxed mt-5 sm:mt-6 font-normal">
            {post.excerpt}
          </p>
        )}

        {/* -------------------------------- Byline + Save Action -------------------------------- */}
        <div className="mt-8 pt-5 border-t border-b border-[#DDD9D0] pb-5 flex items-center justify-between">
          <div className="text-sm sm:text-base text-[#716D65]">
            By <span className="text-[#211E1A] font-normal">{post.author.name}</span>
          </div>
          <SaveButton postId={post.id} initialIsSaved={isSaved} size="sm" />
        </div>

        {/* Large Editorial Hero Image */}
        {post.coverImage && (
          <div className="my-10 sm:my-12 overflow-hidden rounded-[3px] border border-[#DDD9D0]/80">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-auto aspect-3/2 sm:aspect-16/10 object-cover"
            />
          </div>
        )}

        {/* Article Body: 18-21px, line-height 1.78, drop cap, generous spacing */}
        <article className="prose-editorial text-[#2E2A25] pb-12 sm:pb-16 border-b border-[#DDD9D0]">
          <MarkdownView content={post.content} />
        </article>

        {/* Subtle Author Card (Section 12) */}
        <div className="mt-12 sm:mt-16">
          <AuthorCard
            name={post.author.name}
            role="Contributing writer"
            bio={post.author.bio}
            avatarUrl={post.author.avatarUrl}
          />
        </div>

        {/* Keep Reading List (Section 13) */}
        <KeepReading stories={relatedPosts} />
      </div>
    </div>
  );
}
