import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const settings = await db.settings.findUnique({
    where: { id: "default" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Website & Author Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Customize your hero banner, author bio, avatar, and social links.
        </p>
      </div>

      <SettingsForm settings={settings} />
    </div>
  );
}
