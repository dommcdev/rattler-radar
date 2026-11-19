import { MockHeader, NAV_BY_ROLE } from "../../_components/mock-header";
import { VariantSwitcher } from "../../_components/variant-switcher";
import { MOCK_ADMIN } from "../../_lib/data";
import { getAdminData } from "../_components/admin-data";
import { ListingsTable } from "../_components/listings-table";

export default async function AdminTableMockup() {
  const data = await getAdminData();
  return (
    <>
      <MockHeader user={MOCK_ADMIN} nav={NAV_BY_ROLE.admin} active="Admin" />
      <main className="mx-auto w-full max-w-[1400px] px-4 pt-8 pb-32 sm:px-6">
        <ListingsTable data={data} />
      </main>
      <VariantSwitcher section="admin" variant="b" />
    </>
  );
}
