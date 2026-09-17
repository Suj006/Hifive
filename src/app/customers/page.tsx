import { PartyListPage } from "@/components/party-list-page";
import { IconUsers } from "@/components/icons";

export default function CustomersPage() {
  return (
    <PartyListPage
      kind="customer"
      title="Customers"
      description="People you sell finished bracelets & accessories to."
      icon={<IconUsers className="h-6 w-6 text-brand-purple-2" />}
    />
  );
}
