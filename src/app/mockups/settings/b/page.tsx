import type { Metadata } from "next";
import { MockHeader, NAV_BY_ROLE } from "../../_components/mock-header";
import { VariantSwitcher } from "../../_components/variant-switcher";
import { MOCK_STUDENT } from "../../_lib/data";
import { SettingsB } from "../_components/settings-b";

export const metadata: Metadata = { title: "Settings (b) · Mockups" };

export default function SettingsMockupB() {
  return (
    <>
      <MockHeader user={MOCK_STUDENT} nav={NAV_BY_ROLE.student} />
      <SettingsB user={MOCK_STUDENT} />
      <VariantSwitcher section="settings" variant="b" />
    </>
  );
}
