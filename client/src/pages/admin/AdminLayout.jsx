import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/admin", end: true, label: "Overview" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/content", label: "Content" },
  { to: "/admin/reports", label: "Reports" },
];

export default function AdminLayout() {
  return (
    <div className="fx-page fx-admin">
      <div className="fx-page-header">
        <span>
          <strong>Admin</strong>
        </span>
        <span>Manage feedbackX</span>
      </div>

      <nav className="fx-admin__nav" aria-label="Admin sections">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `fx-admin__tab${isActive ? " fx-admin__tab--active" : ""}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  );
}
