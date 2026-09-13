"use client";

import React from "react";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  onClear?: () => void;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search",
  onClear,
  className = "",
}: SearchInputProps) {
  return (
    <div className={`relative w-full ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
        <Search className="w-4 h-4" />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-3 bg-[#f1f5f9] hover:bg-[#e9edf3] focus:bg-white text-slate-900 placeholder-slate-400 rounded-2xl sm:rounded-full text-sm font-medium border border-transparent focus:border-blue-400/50 focus:ring-4 focus:ring-blue-100 transition-all outline-none shadow-2xs"
      />

      {value && (
        <button
          onClick={() => {
            onChange("");
            onClear?.();
          }}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
