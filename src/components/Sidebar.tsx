"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  LogOut,
  DollarSign,
} from "lucide-react";

const navItems = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    id: "nav-dashboard",
  },
  {
    label: "Employees",
    href: "/employees",
    icon: Users,
    id: "nav-employees",
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    id: "nav-analytics",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <DollarSign size={20} color="white" />
        </div>
        <div>
          <div className="sidebar-logo-text">ACME Salary</div>
          <div className="sidebar-logo-sub">Manager · HR Portal</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Navigation</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              id={item.id}
              className={`nav-link ${isActive ? "active" : ""}`}
            >
              <Icon className="nav-icon" size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">HR</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sidebar-user-name">HR Admin</div>
            <div className="sidebar-user-role">admin@acme.com</div>
          </div>
          <button
            onClick={handleLogout}
            id="logout-btn"
            title="Log out"
            className="btn btn-icon btn-secondary"
            style={{ border: "none", padding: 6 }}
          >
            <LogOut size={15} color="var(--text-muted)" />
          </button>
        </div>
      </div>
    </aside>
  );
}
