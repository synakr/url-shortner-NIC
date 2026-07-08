import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 768);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div
      className={`app-wrapper${sidebarOpen ? " sidebar-open" : " sidebar-closed"}`}
    >
      {/* {sidebarOpen && ( */}
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      {/*)}*/}
      <Sidebar isOpen={sidebarOpen} onNavigate={closeSidebar} />
      <div className="main-area">
        <header className="top-bar">
          <button
            type="button"
            className="menu-toggle"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            aria-expanded={sidebarOpen}
          >
            <Menu size={22} />
          </button>
        </header>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
