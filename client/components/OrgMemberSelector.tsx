import SearchableDropdown from "@/components/searchableDropdown";
import { loadMembers, useMembersStore } from "@/services/members";
import { useEffect, useState } from "react";
import { useUserStore } from "@/services/user";
import { DropdownItem } from "@heroui/dropdown";
import { User } from "@heroui/user";
import { Member } from "@/types";

type Props = {
  onMemberChange?: (members: Member[]) => void;
  selectedMemberIds?: string[];
  label?: string;
  showLabel?: boolean;
  className?: string;
  isDisabled?: boolean;
  inline?: boolean;
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

/**
 * Allows the user to select a member from a list of members.
 * If no members are cached, it will load them from the server.
 * Uses the SearchableDropdown component to display the list of members.
 */
export default function MemberSelector({
  onMemberChange,
  selectedMemberIds,
  label,
  isDisabled,
  className,
  inline,
  ...props
}: Props) {
  const members = useMembersStore((state) => state.members);
  const currentOrg = useUserStore((state) => state.currentOrganization);
  const [query, setQuery] = useState("");
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);

  useEffect(() => {
    if (!currentOrg) return;

    if (!members || members.length === 0) {
      loadMembers(currentOrg.id);
    }
  }, [currentOrg, members]);

  useEffect(() => {
    if (!query || query.length === 0) {
      setFilteredMembers(members);
      return;
    }

    setFilteredMembers(members.filter((member) => member.name.toLowerCase().includes(query.toLowerCase())));
  }, [query, members]);

  const onSelectionChangedHandler = (selectedIds: Set<string>) => {
    if (!onMemberChange) return;

    const selectedMembers = members.filter((member) => selectedIds.has(member.id));
    onMemberChange(selectedMembers);
  };

  return <SearchableDropdown {...props}
    isReadOnly={isDisabled}
    items={
      filteredMembers.map((member) => <DropdownItem key={member.id} textValue={member.id}>
        <User name={member.name}
          description={member.description || member.email || member.phone || member.website || ""} />
      </DropdownItem>)}
    className={className}
    selectionMode={"multiple"}
    onSelectionChange={onSelectionChangedHandler}
    onQueryChange={setQuery}
    showLabel={!inline}
    label={label}
    selectedKeys={new Set(selectedMemberIds)}
    trigger={selectedMemberIds?.length ?
      (inline ? <div className={"flex flex-row gap-2"}>
        {
          members.filter((member) => selectedMemberIds.includes(member.id))
            .map((member) => (
              <div key={member.id} className={"overflow-clip truncate text-myblue-600"}>
                <span className={"text-sm font-light select-none text-default-500"}>@</span>
                <span className={"text-sm font-md"}>{member.name}</span>
              </div>))
        }
      </div> :
        <div>
          {members.filter((member) => selectedMemberIds.includes(member.id))
            .map((member) => <User key={member.id} name={member.name}
              description={member.email || member.phone || ""} />)}
        </div>)
      :
      <span className={"text-default-500 w-full"}>Select members</span>
    }
  />;
}