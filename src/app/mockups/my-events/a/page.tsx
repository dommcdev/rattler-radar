import { MockHeader, NAV_BY_ROLE } from "../../_components/mock-header";
import { VariantSwitcher } from "../../_components/variant-switcher";
import { MOCK_LEADER } from "../../_lib/data";
import { MyEventsA } from "../_components/variant-a";

export default function MyEventsPageA() {
  return (
    <>
      <MockHeader
        user={MOCK_LEADER}
        nav={NAV_BY_ROLE.leader}
        active="My events"
        wide={false}
      />
      <main className="mx-auto w-full max-w-[1100px] px-4 pt-8 pb-28 sm:px-6">
        <MyEventsA />
      </main>
      <VariantSwitcher section="my-events" variant="a" />
    </>
  );
}
