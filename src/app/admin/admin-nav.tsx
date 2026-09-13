"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  FolderTree,
  Tags,
  Settings,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { logoutAction } from "./actions";

export function AdminNav({ user }: { user: { name: string; email: string } }) {
  const pathname = usePathname();

  const links = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "All Posts", href: "/admin/posts", icon: FileText },
    { label: "Create Post", href: "/admin/posts/new", icon: PlusCircle },
    { label: "Categories", href: "/admin/categories", icon: FolderTree },
    { label: "Tags", href: "/admin/tags", icon: Tags },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className="w-full lg:w-64 bg-white border-r border-slate-200/80 p-5 flex flex-col justify-between shrink-0">
      <div>
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
              Admin Portal
            </span>
            <h2 className="text-base font-extrabold text-slate-900 truncate">
              {user.name}
            </h2>
            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
          </div>
        </div>

        <nav className="space-y-1.5">
          {links.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-6 mt-6 border-t border-slate-100 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all"
        >
          <span>View Public Site</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
