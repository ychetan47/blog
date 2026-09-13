"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ONBOARDING_CATEGORIES } from "@/lib/onboarding-data";
import { saveTopicsAction } from "@/app/actions/auth-actions";
import { Check, ArrowRight } from "lucide-react";

export function OnboardingView({ initialTopics = [] }: { initialTopics?: string[] }) {
  const [selectedTopics, setSelectedTopics] = useState<string[]>(initialTopics);
  const [hoveredTopic, setHoveredTopic] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const toggleTopic = (name: string) => {
    if (selectedTopics.includes(name)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== name));
    } else {
      setSelectedTopics([...selectedTopics, name]);
    }
  };

  const handleContinue = () => {
    if (selectedTopics.length < 3) return;
    startTransition(async () => {
      await saveTopicsAction(selectedTopics);
      router.push("/");
      router.refresh();
    });
  };

  const meetsRequirement = selectedTopics.length >= 3;

  return (
    <div className="w-full min-h-screen bg-[#F8F7F3] pb-36 pt-12 sm:pt-20">
      <div className="max-w-[760px] mx-auto px-6">
        {/* Top Atomic Orbit Sketch Icon matching screenshots 2 & 3 */}
        <div className="flex justify-center mb-8">
          <svg
            className="w-16 h-16 text-[#211E1A]"
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          >
            <ellipse cx="50" cy="50" rx="36" ry="14" transform="rotate(-30 50 50)" />
            <ellipse cx="50" cy="50" rx="36" ry="14" transform="rotate(30 50 50)" />
            <ellipse cx="50" cy="50" rx="36" ry="14" transform="rotate(90 50 50)" />
            <circle cx="50" cy="50" r="3" fill="currentColor" />
            <circle cx="75" cy="35" r="2" fill="currentColor" />
            <circle cx="28" cy="68" r="2" fill="currentColor" />
          </svg>
        </div>

        {/* Title & Subtitle (Section 16: Serif, font-weight: 400) */}
        <div className="text-center mb-14 sm:mb-18">
          <h1 className="font-editorial text-[38px] sm:text-[50px] lg:text-[56px] text-[#211E1A] font-normal tracking-tight leading-none">
            What would you like to read?
          </h1>
          <p className="text-base text-[#716D65] mt-4 font-normal">
            Choose 3 topics or more to continue.
          </p>
        </div>

        {/* Category Clusters with subtle pastel borders */}
        <div className="space-y-12 sm:space-y-14">
          {ONBOARDING_CATEGORIES.map((cat) => (
            <div key={cat.name} className="space-y-3.5">
              <h2 className="text-sm font-normal uppercase tracking-[0.14em] text-[#716D65]">
                {cat.name}
              </h2>

              <div className="flex flex-wrap gap-2.5 sm:gap-3">
                {cat.topics.map((t) => {
                  const isSelected = selectedTopics.includes(t.name);
                  const isHovered = hoveredTopic === t.name;

                  return (
                    <div key={t.name} className="relative">
                      {isHovered && t.storyCount && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20 px-2.5 py-1 bg-[#211E1A] text-[#F8F7F3] text-[11px] font-normal rounded-sm whitespace-nowrap pointer-events-none after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-[#211E1A]">
                          {t.storyCount} stories
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleTopic(t.name)}
                        onMouseEnter={() => setHoveredTopic(t.name)}
                        onMouseLeave={() => setHoveredTopic(null)}
                        className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-normal transition-all duration-200 cursor-pointer border ${
                          isSelected
                            ? "bg-[#211E1A] text-[#F8F7F3] border-[#211E1A]"
                            : `bg-transparent text-[#211E1A] ${cat.borderColor} hover:border-[#8A867E]`
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#F8F7F3]" />}
                          <span>{t.name}</span>
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-[#F8F7F3]/95 backdrop-blur-xs border-t border-[#DDD9D0] py-4 px-6 z-40">
        <div className="max-w-[760px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span
              className={`font-normal ${
                meetsRequirement ? "text-[#211E1A]" : "text-[#716D65]"
              }`}
            >
              {selectedTopics.length} selected
            </span>
            <span className="text-[#8A867E]">
              {selectedTopics.length < 3
                ? `(choose ${3 - selectedTopics.length} more)`
                : "— Ready to build your feed"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleContinue}
            disabled={!meetsRequirement || isPending}
            className={`flex items-center gap-2 px-6 sm:px-8 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${
              meetsRequirement
                ? "bg-[#211E1A] hover:bg-stone-800 text-[#F8F7F3] cursor-pointer"
                : "bg-[#DDD9D0] text-[#8A867E] cursor-not-allowed"
            }`}
          >
            <span>{isPending ? "Updating feed..." : "Continue"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
