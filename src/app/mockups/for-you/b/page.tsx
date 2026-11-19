import type { Metadata } from "next";
import { MockHeader, NAV_BY_ROLE } from "../../_components/mock-header";
import { VariantSwitcher } from "../../_components/variant-switcher";
import { MOCK_STUDENT } from "../../_lib/data";
import { getMockEvents } from "../../_lib/get-mock-events";
import { ForYouB } from "../_components/for-you-b";

export const metadata: Metadata = { title: "For you (B) · Mockups" };

export default async function ForYouBPage() {
  const { events } = await getMockEvents();
  return (
    <>
      <MockHeader
        user={MOCK_STUDENT}
        nav={NAV_BY_ROLE.student}
        active="For you"
        wide={false}
      />
      <ForYouB events={events} interests={MOCK_STUDENT.interests} />
      <VariantSwitcher section="for-you" variant="b" />
    </>
  );
}
