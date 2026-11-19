import { MockHeader, NAV_BY_ROLE } from "../../_components/mock-header";
import { VariantSwitcher } from "../../_components/variant-switcher";
import { MOCK_LEADER } from "../../_lib/data";
import { PreviewForm } from "../_components/preview-form";

export default function CreateEventB() {
  return (
    <>
      <MockHeader
        user={MOCK_LEADER}
        nav={NAV_BY_ROLE.leader}
        active="My events"
        wide={false}
      />
      <PreviewForm />
      <VariantSwitcher section="create-event" variant="b" />
    </>
  );
}
