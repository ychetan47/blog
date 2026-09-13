"use client";

import React from "react";

export interface CategoryFilterItem {
  id: string;
  label: string;
}

interface CategoryFilterProps {
  categories: CategoryFilterItem[];
  activeCategory: string;
  onSelectCategory: (id: string) => void;
  className?: string;
}

export function CategoryFilter({
  categories,
  activeCategory,
  onSelectCategory,
  className = "",
}: CategoryFilterProps) {
  return (
    <div
      className={`flex items-center gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar py-2 ${className}`}
      role="tablist"
      aria-label="Filter stories by category"
    >
      {categories.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-5 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap cursor-pointer ${
              isActive
                ? "bg-[#211E1A] text-[#F8F7F3] border border-[#211E1A]"
                : "bg-transparent text-[#716D65] border border-[#DDD9D0] hover:text-[#211E1A] hover:border-[#8A867E]"
            }`}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
