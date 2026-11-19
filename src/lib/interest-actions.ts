"use server";

import { redirect } from "next/navigation";
import { isInterestId } from "@/lib/interests";
import { requireSession } from "@/lib/session";
import { safeReturnTo } from "@/lib/sign-in-path";
import { setUserInterests } from "@/lib/user-interests";

/**
 * Saves the interests picked during onboarding, then continues to where the
 * student was headed before signing in. Unknown IDs are ignored.
 */
export async function saveOnboardingInterests(
  interestIds: string[],
  returnTo: string,
): Promise<void> {
  const { user } = await requireSession("/onboarding");
  const ids = [...new Set(interestIds)].filter(isInterestId);
  await setUserInterests(user.id, ids);
  redirect(safeReturnTo(returnTo));
}
