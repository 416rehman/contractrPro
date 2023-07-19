import SearchInput from "@/components/searchInput";
import { loadClients, useClientsStore } from "@/services/clients";
import { useEffect, useState } from "react";
import { useUserStore } from "@/services/user";
import { DropdownItem } from "@nextui-org/dropdown";
import { User } from "@nextui-org/user";
import { Client } from "@/types";

type Props = {
  onClientChange?: (clients: Client[]) => void;
  selectedIds?: string[];
  label?: string;
  isDisabled?: boolean;
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export default function ClientSelector({ onClientChange, selectedIds, label, isDisabled, ...props }: Props) {
  const clients = useClientsStore((state) => state.clients);
  const currentOrg = useUserStore((state) => state.currentOrganization);
  const [selectedClientIds, setSelectedClientIds] = useState(new Set<string>());
  const [query, setQuery] = useState("");
  const [filteredClients, setFilteredClients] = useState([]);

  useEffect(() => {
    if (!selectedIds) return;

    setSelectedClientIds(new Set(selectedIds));
  }, [selectedIds]);

  useEffect(() => {
    if (!onClientChange) return;

    onClientChange(clients.filter((client) => selectedClientIds.has(client.id)));
  }, [selectedClientIds, clients, onClientChange]);

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

  return <SearchInput {...props}
                      isReadOnly={isDisabled}
                      items={
                        filteredClients.map((client) => <DropdownItem key={client.id} textValue={client.id}>
                          <User name={client.name}
                                description={client.description || client.email || client.phone || client.website || ""} />
                        </DropdownItem>)}
                      selectionMode={"single"}
                      onSelectionChange={setSelectedClientIds}
                      onQueryChange={setQuery}
                      label={label}
                      trigger={selectedClientIds.size ?
                        <div>
                          {
                            clients.filter((client) => selectedClientIds.has(client.id))
                              .map((client) => <User key={client.id} name={client.name}
                                                     description={client.description || client.email || client.phone || client.website || ""} />)
                          }
                        </div>
                        :
                        <span>Select Client</span>
                      }
  />;
}