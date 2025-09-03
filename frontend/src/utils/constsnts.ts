import type { MenuItem, RangeKey } from "@/types";
import { LayoutDashboard, PenIcon, Receipt, TrendingUp } from "lucide-react";

export const ranges: { key: RangeKey; label: string }[] = [
  { key: "week", label: "Last week" },
  { key: "month", label: "Last month" },
  { key: "3month", label: "Last 3 months" },
  { key: "year", label: "Last year" },
  { key: "all", label: "All time" },
];

export const PAGE_SIZE = 5;

export const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  { id: "budget", label: "IntelliAdd", icon: PenIcon, path: "/add" },
  {
    id: "transactions",
    label: "Transactions",
    icon: Receipt,
    path: "/transactions",
  },
  { id: "analytics", label: "Analytics", icon: TrendingUp, path: "/analytics" },
];
