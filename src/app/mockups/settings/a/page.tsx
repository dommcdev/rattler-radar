import type { Metadata } from "next";
import { MockHeader, NAV_BY_ROLE } from "../../_components/mock-header";
import { VariantSwitcher } from "../../_components/variant-switcher";
import { MOCK_STUDENT } from "../../_lib/data";
import { SettingsA } from "../_components/settings-a";

export const metadata: Metadata = { title: "Settings (a) · Mockups" };

export default function SettingsMockupA() {
  return (
    <>
      <MockHeader user={MOCK_STUDENT} nav={NAV_BY_ROLE.student} />
      <SettingsA user={MOCK_STUDENT} />
      <VariantSwitcher section="settings" variant="a" />
    </>
  );
}
