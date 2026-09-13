"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string | null;
}

interface CategoryTabsProps {
  categories: Category[];
  activeSlug?: string;
  onSelectCategory?: (slug: string) => void;
  basePath?: string; // if navigation is desired e.g. "/" or "/blogs"
}

export function CategoryTabs({
  categories,
  activeSlug = "all",
  onSelectCategory,
  basePath,
}: CategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const allTabs = [
    { id: "all", name: "Featured", slug: "featured" },
    { id: "latest", name: "Latest", slug: "latest" },
    { id: "trending", name: "Trending", slug: "trending" },
    ...categories.filter(
      (c) => !["featured", "latest", "trending"].includes(c.slug.toLowerCase())
    ),
  ];

  return (
    <div className="relative w-full my-4 select-none">
      <div
        ref={scrollRef}
        className="flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1 text-base sm:text-lg"
      >
        {allTabs.map((tab) => {
          const isActive =
            activeSlug === tab.slug ||
            (activeSlug === "all" && tab.slug === "featured") ||
            activeSlug === tab.name.toLowerCase();

          const content = (
            <span
              className={`whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? "text-slate-900 font-bold tracking-tight scale-105 inline-block"
                  : "text-slate-400 hover:text-slate-600 font-medium"
              }`}
            >
              {tab.name}
            </span>
          );

          if (basePath) {
            const href =
              tab.slug === "featured"
                ? basePath
                : `${basePath}?category=${tab.slug}`;
            return (
              <Link key={tab.slug} href={href} className="inline-block">
                {content}
              </Link>
            );
          }

          return (
            <button
              key={tab.slug}
              type="button"
              onClick={() => onSelectCategory?.(tab.slug)}
              className="focus:outline-none"
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
