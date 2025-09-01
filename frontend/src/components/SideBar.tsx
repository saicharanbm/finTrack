import {
  LayoutDashboard,
  Receipt,
  TrendingUp,
  Settings,
  User,
  PenIcon,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuthQuery } from "@/services/queries";
import React from "react";
import icon from "@/assets/icon.png";
import { cn } from "@/utils";

type MenuItem = {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  path: string;
};

const menuItems: MenuItem[] = [
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

  { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
];

const Sidebar: React.FC = () => {
  const { data: userData } = useAuthQuery();

  return (
    <aside className="w-full h-screen overflow-auto bg-theme text-white flex flex-col  justify-between pt-8">
      {/* Header */}
      <div className="flex items-center justify-center gap-3">
        <div className="size-14 bg-white rounded-full overflow-hidden flex items-center justify-center">
          <img src={icon} alt="" />
        </div>
        <span className="text-4xl font-bold tracking-wide">FinTrack</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 py-16 ">
        <ul className="space-y-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-white/20 text-white border-l-4 border-white"
                        : "text-blue-100 hover:bg-white/10 hover:text-white"
                    )
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-6 w-full">
        <div className="flex items-center gap-3 ">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
            {userData?.user?.profilePic ? (
              <img
                src={userData.user.profilePic}
                alt="Profile"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="min-w-0">
            <span className="block text-lg font-medium truncate text-gray-300">
              {userData?.user?.name ?? "Sai"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
