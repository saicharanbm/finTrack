import { useEffect } from "react";
import { Sun, Moon, LogOut, User, ChevronRight } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import { useDropdown } from "@/hooks/useDropdown";
import { cn } from "@/utils";
import icon from "@/assets/icon.png";
import { menuItems } from "@/utils/constsnts";
import { queryClient } from "@/main";
import { toast } from "react-toastify";
import { useLogoutMutation } from "@/services/mutations";

const NavBar = () => {
  type CachedAuth = { user: { name: string; profilePic: string } };
  const cachedAuth = queryClient.getQueryData(["auth", "user"]) as CachedAuth;
  const { isDark, toggleTheme } = useTheme();
  const { open, setOpen, panelRef, buttonRef } = useDropdown();
  const { mutateAsync: logout } = useLogoutMutation();

  const location = useLocation();
  const navigate = useNavigate();

  // Close dropdown on route change
  useEffect(() => setOpen(false), [location.pathname, setOpen]);

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

  const profilePic = cachedAuth?.user?.profilePic ?? "";
  const userName = cachedAuth?.user?.name ?? "Sai";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-white/10 bg-theme text-white "
      )}
    >
      <div className="mx-auto flex items-center justify-between px-4 py-3">
        {/* Brand */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 rounded-md focus:outline-none focus-visible:ring focus-visible:ring-white/30"
        >
          <div className="size-8 bg-white rounded-full overflow-hidden flex items-center justify-center">
            <img
              src={icon}
              alt="FinTrack"
              className="h-full w-full object-cover"
            />
          </div>
          <span className="text-xl font-bold tracking-wide">FinTrack</span>
        </button>

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className={cn(
              "inline-flex items-center justify-center rounded-lg px-3 py-2 transition",
              isDark
                ? "bg-white/10 text-blue-100 hover:bg-white/20 hover:text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {/* Avatar -> Dropdown */}
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={open}
              title={userName}
              className="flex items-center rounded-full focus:outline-none focus-visible:ring focus-visible:ring-white/30"
            >
              <div className="size-9 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center ring-2 ring-white/20">
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="h-5 w-5 text-white" />
                )}
              </div>
            </button>

            {open && (
              <>
                {/* backdrop for easy dismiss on touch screens */}
                <div
                  className="fixed inset-0 z-10"
                  aria-hidden="true"
                  onClick={() => setOpen(false)}
                />
                <div
                  ref={panelRef}
                  role="menu"
                  aria-label="Mobile navigation"
                  className={cn(
                    "absolute right-0 mt-2 z-20 w-[18rem] origin-top-right rounded-xl",
                    "border border-white/10 bg-theme/95 backdrop-blur shadow-2xl ring-1 ring-black/5"
                  )}
                >
                  {/* Dropdown header */}
                  <div className="flex items-center gap-3 p-4 border-b border-white/10">
                    <div className="size-10 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center">
                      {profilePic ? (
                        <img
                          src={profilePic}
                          alt="Profile"
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <User className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-blue-100">
                        Signed in as
                      </p>
                      <p className="truncate font-medium">{userName}</p>
                    </div>
                  </div>

                  {/* Nav items */}
                  <nav className="p-2">
                    <ul className="max-h-[50vh] overflow-auto">
                      {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <li key={item.id}>
                            <NavLink
                              to={item.path}
                              role="menuitem"
                              className={({ isActive }) =>
                                cn(
                                  "flex items-center justify-between gap-3 rounded-lg px-3 py-3 transition",
                                  isActive
                                    ? "bg-white/15 text-white"
                                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                                )
                              }
                            >
                              <span className="flex items-center gap-3">
                                <Icon className="h-4 w-4" />
                                <span className="font-medium">
                                  {item.label}
                                </span>
                              </span>
                              <ChevronRight className="h-4 w-4 opacity-60" />
                            </NavLink>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>

                  {/* Logout */}
                  <div className="p-2 border-t border-white/10">
                    <button
                      onClick={handleLogout}
                      className={cn(
                        "w-full inline-flex items-center justify-center gap-2 rounded-lg px-3 py-3 transition",
                        isDark
                          ? "bg-red-500/20 text-red-200 hover:bg-red-500/30"
                          : "bg-red-50 text-red-600 hover:bg-red-100"
                      )}
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
