"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { StoryCard, StoryData } from "./story-card";
import { CategoryFilter } from "./category-filter";

interface HomeViewProps {
  stories: StoryData[];
  userTopics?: string[];
  userName?: string;
}

export function HomeView({ stories, userTopics = [], userName }: HomeViewProps) {
  const [activeTab, setActiveTab] = useState<string>("all");

  const categories = [
    { id: "all", label: "All" },
    ...(userTopics.length > 0 ? [{ id: "for-you", label: "For You" }] : []),
    { id: "design", label: "Design" },
    { id: "culture", label: "Culture" },
    { id: "craft", label: "Craft" },
    { id: "technology", label: "Technology" },
    { id: "programming", label: "Programming" },
  ];

  const filteredStories = useMemo(() => {
    if (activeTab === "all") {
      return stories;
    }

    if (activeTab === "for-you") {
      if (userTopics.length === 0) return stories;
      const lowerTopics = userTopics.map((t) => t.toLowerCase());

      const matched = stories.filter((story) => {
        const catMatch =
          story.category && lowerTopics.includes(story.category.name.toLowerCase());
        const tagMatch = story.tags?.some((t) =>
          lowerTopics.includes(t.tag.name.toLowerCase())
        );
        return catMatch || tagMatch;
      });

      return matched.length > 0 ? matched : stories;
    }

    return stories.filter(
      (s) => s.category?.slug.toLowerCase() === activeTab.toLowerCase()
    );
  }, [stories, activeTab, userTopics]);

  return (
    <div className="w-full min-h-screen bg-[#F8F7F3] pb-24 sm:pb-32">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-12 lg:px-16 pt-12 sm:pt-20 lg:pt-28">
        {/* Editorial Hero (Section 3 & 6: 64-88px desktop, 42-52px mobile, weight 400, line-height ~1.0, tracking -0.04em) */}
        <section className="mb-14 sm:mb-20">
          <h1 className="font-editorial text-[42px] sm:text-[60px] lg:text-[76px] xl:text-[84px] text-[#211E1A] font-normal tracking-[-0.04em] leading-[0.98] max-w-4xl">
            Slow reading for a fast internet.
          </h1>
          <p className="text-[#716D65] text-lg sm:text-xl lg:text-[22px] mt-6 sm:mt-8 leading-relaxed font-normal max-w-2xl">
            Essays on typography, attention and the craft of making things worth finishing.
          </p>
        </section>

        {/* Subtle Divider Line before category filters (matching Screenshot 4) */}
        <div className="border-t border-[#DDD9D0] pt-6 sm:pt-8 mb-8 sm:mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Category Filter Pills */}
          <CategoryFilter
            categories={categories}
            activeCategory={activeTab}
            onSelectCategory={setActiveTab}
          />

          {userTopics.length > 0 && (
            <Link
              href="/onboarding"
              className="text-xs uppercase tracking-wider text-[#8A867E] hover:text-[#211E1A] transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              Edit topics ({userTopics.length})
            </Link>
          )}
        </div>

        {/* Story List with subtle dividers and desktop split layout */}
        <div className="border-t border-[#DDD9D0]">
          {filteredStories.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-editorial text-2xl text-[#211E1A] font-normal mb-2">
                No stories found in this section
              </p>
              <p className="text-sm text-[#716D65]">
                Switch back to the <button onClick={() => setActiveTab("all")} className="underline cursor-pointer">All</button> tab to explore more essays.
              </p>
            </div>
          ) : (
            filteredStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
