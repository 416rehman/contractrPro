import SearchableDropdown from "@/components/searchableDropdown";
import { loadClients, useClientsStore } from "@/services/clients";
import { useEffect, useState } from "react";
import { useUserStore } from "@/services/user";
import { DropdownItem } from "@nextui-org/dropdown";
import { User } from "@nextui-org/user";
import { Client } from "@/types";

type Props = {
  onClientChange?: (clients: Client[]) => void;
  selectedClientIds?: string[];
  label?: string;
  isDisabled?: boolean;
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

/**
 * Allows the user to select a client from a list of clients.
 * If no clients are cached, it will load them from the server.
 * Uses the SearchableDropdown component to display the list of clients.
 */
export default function ClientSelector({ onClientChange, selectedClientIds, label, isDisabled, ...props }: Props) {
  const clients = useClientsStore((state) => state.clients);
  const currentOrg = useUserStore((state) => state.currentOrganization);
  const [query, setQuery] = useState("");
  const [filteredClients, setFilteredClients] = useState([]);

  useEffect(() => {
    if (!currentOrg) return;

    if (!clients || clients.length === 0) {
      loadClients(currentOrg.id);
    }
  }, [currentOrg, clients]);

  useEffect(() => {
    if (!query || query.length === 0) {
      setFilteredClients(clients);
      return;
    }

    setFilteredClients(clients.filter((client) => client.name.toLowerCase().includes(query.toLowerCase())));
  }, [query, clients]);

  const onSelectionChangedHandler = (selectedIds: Set<string>) => {
    if (!onClientChange) return;

    const selectedClients = clients.filter((client) => selectedIds.has(client.id));
    onClientChange(selectedClients);
  };

  return <SearchableDropdown {...props}
                             isReadOnly={isDisabled}
                             items={
                               filteredClients.map((client) => <DropdownItem key={client.id} textValue={client.id}>
                                 <User name={client.name}
                                       description={client.description || client.email || client.phone || client.website || ""} />
                               </DropdownItem>)}
                             selectionMode={"single"}
                             onSelectionChange={onSelectionChangedHandler}
                             onQueryChange={setQuery}
                             label={label}
                             trigger={selectedClientIds?.[0] ?
                               <div className={"flex"}>
                                 {
                                   clients.filter((client) => selectedClientIds.includes(client.id))
                                     .map((client) => <User key={client.id} name={client.name}
                                                            description={client.description || client.email || client.phone || client.website || ""} />)
                                 }
                               </div>
                               :
                               <span>Select Client</span>
                             }
  />;
}