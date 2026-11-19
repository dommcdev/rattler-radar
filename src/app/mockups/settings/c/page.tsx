import type { Metadata } from "next";
import { MockHeader, NAV_BY_ROLE } from "../../_components/mock-header";
import { VariantSwitcher } from "../../_components/variant-switcher";
import { MOCK_STUDENT } from "../../_lib/data";
import { SettingsC } from "../_components/settings-c";

export const metadata: Metadata = { title: "Settings (c) · Mockups" };

export default function SettingsMockupC() {
  return (
    <>
      <MockHeader user={MOCK_STUDENT} nav={NAV_BY_ROLE.student} />
      <SettingsC user={MOCK_STUDENT} />
      <VariantSwitcher section="settings" variant="c" />
    </>
  );
}
