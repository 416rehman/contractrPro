import React, { useEffect, useState } from "react";
import { Card } from "@nextui-org/card";
import {
  IconBuilding,
  IconBuildingStore,
  IconChartTreemap,
  IconCircleDot,
  IconClipboardList,
  IconDevicesDollar,
  IconPaperclip,
  IconReceipt2,
  IconUsers
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";

type SearchItemProps = {
  type?: "organizationMember" | "contract" | "invoice" | "expense" | "job" | "client" | "vendor" | "attachment";
  query?: string;
  item?: any;
  onClick?: () => void;
}

const getIcon = (type: SearchItemProps["type"]) => {
  switch (type) {
    case "organizationMember":
      return <IconUsers />;
    case "contract":
      return <IconChartTreemap />;
    case "invoice":
      return <IconReceipt2 />;
    case "expense":
      return <IconDevicesDollar />;
    case "job":
      return <IconClipboardList size={28} />;
    case "client":
      return <IconBuilding />;
    case "vendor":
      return <IconBuildingStore />;
    case "attachment":
      return <IconPaperclip />;
    default:
      return <IconCircleDot />;
  }
};

const getSubtitle = (type: SearchItemProps["type"], item: any) => {
  switch (type) {
    case "organizationMember":
      return item?.name;
    case "contract":
      return item?.name;
    case "invoice":
      return item?.invoiceNumber;
    case "expense":
      return item?.expenseNumber;
    case "job":
      return item?.name;
    case "client":
      return item?.name;
    case "vendor":
      return item?.name;
    case "attachment":
      return item?.Comment?.content;
    default:
      return "";
  }
};

const getLink = (type: SearchItemProps["type"], item: any) => {
  switch (type) {
    case "organizationMember":
      return `/members/${item.id}`;
    case "contract":
      return `/contracts/${item.id}`;
    case "invoice":
      return `/invoices/${item.id}`;
    case "expense":
      return `/expenses/${item.id}`;
    case "job":
      return `/contracts/${item?.Contract?.id}`;
    case "client":
      return `/clients/${item.id}`;
    case "vendor":
      return `/vendors/${item.id}`;
    case "attachment": {
      if (item?.Comment?.VendorId) return `/vendors/${item?.Comment?.VendorId}`;
      if (item?.Comment?.ClientId) return `/clients/${item?.Comment?.ClientId}`;
      if (item?.Comment?.ContractId) return `/contracts/${item?.Comment?.ContractId}`;
      if (item?.Comment?.InvoiceId) return `/invoices/${item?.Comment?.InvoiceId}`;
      if (item?.Comment?.ExpenseId) return `/expenses/${item?.Comment?.ExpenseId}`;
      return `#`;
    }
    default:
      return `#`;
  }
};

/**
 * SearchItem component is used by the SearchBox component to display search results, this receives an item and displays it according to its type and its fields
 */
export default function SearchItem({ type, query, item, onClick }: SearchItemProps) {
  const router = useRouter();
  const [parts, setParts] = useState<string[]>([]);
  const [title, setTitle] = useState<string>("");
  const [fieldName, setFieldName] = useState<string>("");
  const [subtitle, setSubtitle] = useState<string>("");

  useEffect(() => {
    // The title will be whatever key has the query in it
    if (item) {
      const key = Object.keys(item).find((key) =>
        typeof item[key] === "string" && // Ensure the value is a string
        key !== "id" && // Ensure the key is not the id
        item[key]?.toLowerCase().includes(query.toLowerCase())
      );
      if (key) {
        setFieldName(key);
        setTitle(item[key]);
        setSubtitle(getSubtitle(type, item));
      }
    }
  }, [item, query, type]);

  useEffect(() => {
    if (query && title) {
      const titleParts = title.split(new RegExp(`(${query})`, "i")); // Use case-insensitive regex
      setParts(titleParts);
    } else {
      setParts([]);
    }
  }, [query, title]);

  return (
    <Card shadow={"none"}
          className={"p-2 flex flex-row gap-2 items-center rounded-md border-1 border-default-200 bg-content2 hover:bg-content3 truncate"}
          isPressable={true} onPress={() => {
      router.push(getLink(type, item) + "#:~:text=" + query);
      onClick?.();
    }}>
      <div className={"text-default-500"}>{getIcon(type)}</div>
      <div className={"flex flex-col w-full truncate items-start"}>
        <div className={"flex flex-row items-center justify-between truncate w-full"}>
          <p className={"text-sm font-medium truncate"}>
            {parts.map((part, index) => (
              <React.Fragment key={index}>
                {index % 2 === 1 ? (
                  <u className={"text-primary"}>{part}</u>
                ) : (
                  part
                )}
              </React.Fragment>
            ))}
          </p>
          <span className={"text-default-400 font-medium text-xs ml-1 truncate uppercase"}>{fieldName}</span>
        </div>
        <p className={"text-sm text-default-500 capitalize truncate"}>{subtitle}</p>
      </div>
    </Card>
  );
};