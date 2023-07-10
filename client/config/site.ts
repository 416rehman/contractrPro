import {
  IconBuilding,
  IconBuildingStore,
  IconChartTreemap,
  IconDashboard,
  IconDevicesDollar,
  IconReceipt2,
  IconUsers
} from "@tabler/icons-react";

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "ContractrPro",
  description: "Take control of your business",
  sidebarItems: [
    {
      label: "Dashboard",
      href: "/",
      icon: IconDashboard,
      shortDescription: "Your organization at a glance"
    },
    {
      label: "Contracts",
      href: "/contracts",
      icon: IconChartTreemap,
      shortDescription: "Manage your contracts"
    },
    {
      label: "Expenses",
      href: "/expenses",
      icon: IconDevicesDollar,
      shortDescription: "The money you spend"
    },
    {
      label: "Invoices",
      href: "/invoices",
      icon: IconReceipt2,
      shortDescription: "The money you make"
    },
    {
      label: "Employees",
      href: "/employees",
      icon: IconUsers,
      shortDescription: "Members of your organization"
    },
    {
      label: "Clients",
      href: "/clients",
      icon: IconBuilding,
      shortDescription: "The people/organizations you provide services to"
    },
    {
      label: "Vendors",
      href: "/vendors",
      icon: IconBuildingStore,
      shortDescription: "The people/organizations you buy from"
    }
  ]
};