import React from "react";
import { getAdminSession } from "@/lib/auth";
import { AdminNav } from "./admin-nav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  // If no session, render the children directly (login page handles login form)
  if (!session) {
    return <div className="min-h-screen bg-[#ebf2fd]">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row">
      <AdminNav user={{ name: session.name, email: session.email }} />
      <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-6xl overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
