import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/auth";
import { OnboardingView } from "./onboarding-view";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await getUserSession();
  if (!user) {
    redirect("/login");
  }

  return <OnboardingView initialTopics={user.topics || []} />;
}
