import type { Metadata } from "next";
import { MockHeader, NAV_BY_ROLE } from "../../_components/mock-header";
import { VariantSwitcher } from "../../_components/variant-switcher";
import { MOCK_STUDENT } from "../../_lib/data";
import { getMockEvents } from "../../_lib/get-mock-events";
import { ForYouA } from "../_components/for-you-a";

export const metadata: Metadata = { title: "For you (A) · Mockups" };

export default async function ForYouAPage() {
  const { events } = await getMockEvents();
  return (
    <>
      <MockHeader
        user={MOCK_STUDENT}
        nav={NAV_BY_ROLE.student}
        active="For you"
      />
      <ForYouA events={events} interests={MOCK_STUDENT.interests} />
      <VariantSwitcher section="for-you" variant="a" />
    </>
  );
}
