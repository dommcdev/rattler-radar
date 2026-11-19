import { MockHeader, NAV_BY_ROLE } from "../../_components/mock-header";
import { VariantSwitcher } from "../../_components/variant-switcher";
import { MOCK_LEADER } from "../../_lib/data";
import { SectionedForm } from "../_components/sectioned-form";

export default function CreateEventA() {
  return (
    <>
      <MockHeader
        user={MOCK_LEADER}
        nav={NAV_BY_ROLE.leader}
        active="My events"
      />
      <SectionedForm />
      <VariantSwitcher section="create-event" variant="a" />
    </>
  );
}
