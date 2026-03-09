import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export function AppShell() {
  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
      {/* Fixed sidebar */}
      <Sidebar />

      {/* Main content — offset by sidebar width */}
      <main
        className="flex-1 ml-[224px] min-h-screen overflow-y-auto"
        id="main-content"
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AppShell;
