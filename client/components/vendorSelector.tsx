import SearchableDropdown from "@/components/searchableDropdown";
import { loadVendors, useVendorsStore } from "@/services/vendors";
import { useEffect, useState } from "react";
import { useUserStore } from "@/services/user";
import { DropdownItem } from "@heroui/dropdown";
import { User } from "@heroui/user";
import { Vendor } from "@/types";

type Props = {
  onVendorChange?: (vendors: Vendor[]) => void;
  selectedVendorIds?: string[];
  label?: string;
  isDisabled?: boolean;
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

/**
 * Allows the user to select a vendor from a list of vendors.
 * If no vendors are cached, it will load them from the server.
 * Uses the SearchableDropdown component to display the list of vendors.
 */
export default function VendorSelector({ onVendorChange, selectedVendorIds, label, isDisabled, ...props }: Props) {
  const vendors = useVendorsStore((state) => state.vendors);
  const currentOrg = useUserStore((state) => state.currentOrganization);
  const [query, setQuery] = useState("");
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    if (!currentOrg) return;

    if (!vendors || vendors.length === 0) {
      loadVendors(currentOrg.id);
    }
  }, [currentOrg, vendors]);

  useEffect(() => {
    if (!query || query.length === 0) {
      setFilteredVendors(vendors);
      return;
    }

    setFilteredVendors(vendors.filter((vendor) => vendor.name.toLowerCase().includes(query.toLowerCase())));
  }, [query, vendors]);

  const onSelectionChangedHandler = (selectedIds: Set<string>) => {
    if (!onVendorChange) return;

    const selectedVendors = vendors.filter((vendor) => selectedIds.has(vendor.id));
    onVendorChange(selectedVendors);
  };

  return <SearchableDropdown {...props}
    isReadOnly={isDisabled}
    items={
      filteredVendors.map((vendor) => <DropdownItem key={vendor.id} textValue={vendor.id}>
        <User name={vendor.name}
          description={vendor.description || vendor.email || vendor.phone || vendor.website || ""} />
      </DropdownItem>)}
    selectionMode={"single"}
    onSelectionChange={onSelectionChangedHandler}
    onQueryChange={setQuery}
    label={label}
    trigger={selectedVendorIds?.[0] ?
      <div>
        {
          vendors.filter((vendor) => selectedVendorIds.includes(vendor.id))
            .map((vendor) => <User key={vendor.id} name={vendor.name}
              description={vendor.description || vendor.email || vendor.phone || vendor.website || ""} />)
        }
      </div>
      :
      <span>Select Vendor</span>
    }
  />;
}