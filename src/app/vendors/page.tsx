import { PartyListPage } from "@/components/party-list-page";
import { IconTruck } from "@/components/icons";

export default function VendorsPage() {
  return (
    <PartyListPage
      kind="vendor"
      title="Vendors"
      description="Suppliers you buy raw materials from."
      icon={<IconTruck className="h-6 w-6 text-brand-purple-2" />}
    />
  );
}
