import type { Metadata } from "next";
import { MockHeader, NAV_BY_ROLE } from "../../_components/mock-header";
import { VariantSwitcher } from "../../_components/variant-switcher";
import { getMockEvents } from "../../_lib/get-mock-events";
import { NEW_STUDENT, toOnboardingEvent } from "../_components/data";
import { PillsOnboarding } from "../_components/pills-onboarding";

export const metadata: Metadata = { title: "Pick interests · RattlerRadar" };

export default async function OnboardingMockupA() {
  const { events } = await getMockEvents();

  return (
    <>
      <MockHeader user={NEW_STUDENT} nav={NAV_BY_ROLE.student} wide={false} />
      <PillsOnboarding events={events.map(toOnboardingEvent)} />
      <VariantSwitcher section="onboarding" variant="a" />
    </>
  );
}
