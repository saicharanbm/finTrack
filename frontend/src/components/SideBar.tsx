import { User, Sun, Moon, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthQuery } from "@/services/queries";
import icon from "@/assets/icon.png";
import { cn } from "@/utils";
import { useTheme } from "@/hooks/useTheme";
import { useLogoutMutation } from "@/services/mutations";
import { toast } from "react-toastify";
import { menuItems } from "@/utils/constsnts";

const Sidebar = () => {
  const { data: userData } = useAuthQuery();
  const { isDark, toggleTheme } = useTheme();
  const { mutateAsync: logout } = useLogoutMutation();
  const navigate = useNavigate();
  const handleLogout = () => {
    toast.promise(logout(), {
      pending: "Logging out...",
      success: {
        render() {
          navigate("/");
          return "Logout successful!";
        },
      },
      error: {
        render({ data }: { data: string }) {
          console.log(data);
          return (data as string) || "Logout failed!";
        },
      },
    });
  };

  return (
    <aside className="w-full h-screen overflow-auto bg-theme text-white flex flex-col justify-between pt-8">
      {/* Header */}
      <div className="flex items-center justify-center gap-3">
        <div className="size-14 bg-white rounded-full overflow-hidden flex items-center justify-center">
          <img src={icon} alt="" />
        </div>
        <span className="text-4xl font-bold tracking-wide">FinTrack</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 py-16">
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

      {/* Theme Toggle + Logout */}
      <div className="px-6 pb-4">
        <div className="flex items-center justify-between gap-3 mb-4">
          <button
            onClick={toggleTheme}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200",
              isDark
                ? "bg-white/10 text-blue-100 hover:bg-white/20 hover:text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
            )}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {isDark ? "Light" : "Dark"}
            </span>
          </button>

          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200",
              isDark
                ? "bg-red-500/20 text-red-300 hover:bg-red-500/30 hover:text-red-200"
                : "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
            )}
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-6 w-full">
        <div className="flex items-center gap-3">
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
