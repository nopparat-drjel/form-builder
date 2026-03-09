import { NavLink } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { I } from "@/components/ui/Icon";

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/forms", label: "แบบฟอร์ม", icon: "description" },
  { to: "/responses", label: "ใบสมัคร", icon: "inbox" },
];

export function Sidebar() {
  const { user, logout } = useAuthStore();

  return (
    <aside
      className="w-[224px] h-screen flex flex-col bg-[#f5f5f5] shadow-neu fixed left-0 top-0 z-20"
      aria-label="Sidebar navigation"
    >
      {/* Logo / Brand */}
      <div className="px-5 py-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-green-700 shadow-[2px_2px_6px_#1a4d24,_-2px_-2px_6px_#48b356] flex items-center justify-center">
          <I name="article" size={20} fill={1} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-green-900 leading-tight">
            HR FormKit
          </p>
          <p className="text-[10px] text-gray-500 leading-tight">
            {user?.tenantId ?? "Workspace"}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
                "transition-all duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500",
                isActive
                  ? "bg-green-700 text-white shadow-[2px_2px_6px_#1a4d24,_-2px_-2px_6px_#48b356]"
                  : "text-gray-600 hover:bg-white/60 hover:shadow-neu-xs",
              ].join(" ")
            }
          >
            {({ isActive }) => (
              <>
                <I
                  name={item.icon}
                  size={20}
                  fill={isActive ? 1 : 0}
                  className={isActive ? "text-white" : "text-gray-500"}
                />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl">
          <div className="w-7 h-7 rounded-full bg-green-100 shadow-neu-xs flex items-center justify-center shrink-0">
            <I name="person" size={16} fill={1} className="text-green-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-700 truncate">
              {user?.email ?? "ผู้ใช้งาน"}
            </p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">
              {user?.role ?? "HR Admin"}
            </p>
          </div>
          <button
            onClick={logout}
            className="p-1 rounded-lg text-gray-400 hover:text-red-500 focus:outline-none focus-visible:ring-1 focus-visible:ring-red-400 transition-colors"
            title="ออกจากระบบ"
            aria-label="ออกจากระบบ"
          >
            <I name="logout" size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
