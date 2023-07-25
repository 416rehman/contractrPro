import SearchInput from "@/components/searchInput";
import { loadOrgMembers, useOrgMembersStore } from "@/services/members";
import { useEffect, useState } from "react";
import { useUserStore } from "@/services/user";
import { DropdownItem } from "@nextui-org/dropdown";
import { User } from "@nextui-org/user";
import { OrgMember } from "@/types";

type Props = {
  onOrgMemberChange?: (members: OrgMember[]) => void;
  selectedOrgMemberIds?: string[];
  label?: string;
  showLabel?: boolean;
  className?: string;
  isDisabled?: boolean;
  inline?: boolean;
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

/**
 * Allows the user to select a member from a list of members.
 * If no members are cached, it will load them from the server.
 * Uses the SearchInput component to display the list of members.
 */
export default function OrgMemberSelector({
                                            onOrgMemberChange,
                                            selectedOrgMemberIds,
                                            label,
                                            isDisabled,
                                            className,
                                            inline,
                                            ...props
                                          }: Props) {
  const members = useOrgMembersStore((state) => state.orgMembers);
  const currentOrg = useUserStore((state) => state.currentOrganization);
  const [query, setQuery] = useState("");
  const [filteredOrgMembers, setFilteredOrgMembers] = useState([]);

  useEffect(() => {
    if (!currentOrg) return;

    if (!members || members.length === 0) {
      loadOrgMembers(currentOrg.id);
    }
  }, [currentOrg, members]);

  useEffect(() => {
    if (!query || query.length === 0) {
      setFilteredOrgMembers(members);
      return;
    }

    setFilteredOrgMembers(members.filter((member) => member.name.toLowerCase().includes(query.toLowerCase())));
  }, [query, members]);

  const onSelectionChangedHandler = (selectedIds: Set<string>) => {
    if (!onOrgMemberChange) return;

    const selectedOrgMembers = members.filter((member) => selectedIds.has(member.id));
    onOrgMemberChange(selectedOrgMembers);
  };

  return <SearchInput {...props}
                      isReadOnly={isDisabled}
                      items={
                        filteredOrgMembers.map((member) => <DropdownItem key={member.id} textValue={member.id}>
                          <User name={member.name}
                                description={member.description || member.email || member.phone || member.website || ""} />
                        </DropdownItem>)}
                      className={className}
                      selectionMode={"multiple"}
                      onSelectionChange={onSelectionChangedHandler}
                      onQueryChange={setQuery}
                      showLabel={!inline}
                      label={label}
                      selectedKeys={new Set(selectedOrgMemberIds)}
                      trigger={selectedOrgMemberIds?.length ?
                        (inline ? <div className={"flex flex-row gap-2"}>
                            {
                              members.filter((member) => selectedOrgMemberIds.includes(member.id))
                                .map((member) => (
                                  <div key={member.id} className={"overflow-clip truncate text-myblue-600"}>
                                    <span className={"text-sm font-light select-none text-default-500"}>@</span>
                                    <span className={"text-sm font-md"}>{member.name}</span>
                                  </div>))
                            }
                          </div> :
                          <div>
                            {members.filter((member) => selectedOrgMemberIds.includes(member.id))
                              .map((member) => <User key={member.id} name={member.name}
                                                     description={member.email || member.phone || ""} />)}
                          </div>)
                        :
                        <span className={"text-default-500 w-full"}>Select members</span>
                      }
  />;
}