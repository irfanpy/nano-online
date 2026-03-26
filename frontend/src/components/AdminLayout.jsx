import { NavLink, Outlet, useLocation } from "react-router-dom";
import Icon from "./Icon.jsx";

const NAV_GROUPS = [
  {
    label: "Core",
    items: [{ path: "/admin/dashboard", text: "Dashboard", icon: "dashboard" }],
  },
  {
    label: "Helpers",
    items: [
      { path: "/admin/helpers", text: "Helpers", icon: "helpers" },
      { path: "/admin/roles", text: "Roles", icon: "roles" },
      { path: "/admin/availability", text: "Availability", icon: "availability" },
      { path: "/admin/skills", text: "Skills", icon: "skills" },
      { path: "/admin/helper-skills", text: "Helper Skills", icon: "helper-skills" },
      { path: "/admin/experience", text: "Experience", icon: "experience" },
      { path: "/admin/documents", text: "Documents", icon: "documents" },
    ],
  },
  {
    label: "Placements",
    items: [
      { path: "/admin/employers", text: "Employers", icon: "employers" },
      { path: "/admin/job-requests", text: "Job Requests", icon: "job-requests" },
      { path: "/admin/assignments", text: "Assignments", icon: "assignments" },
    ],
  },
  {
    label: "Setup",
    items: [{ path: "/admin/locations", text: "Locations", icon: "locations" }],
  },
];

const PAGE_META = [
  {
    path: "/admin/dashboard",
    kicker: "Operations hub",
    title: "Control the full placement pipeline",
    description: "Track helpers, employers, assignments, and compliance from a single admin workspace.",
  },
  {
    path: "/admin/helpers",
    kicker: "Helper records",
    title: "Manage your active talent pool",
    description: "Keep helper profiles, notes, and role assignments current before matching them to homes.",
  },
  {
    path: "/admin/roles",
    kicker: "Role catalog",
    title: "Standardize helper categories",
    description: "Define the role structure used across sourcing, shortlisting, and placements.",
  },
  {
    path: "/admin/availability",
    kicker: "Scheduling",
    title: "See who is available and when",
    description: "Use availability windows to prevent assignment conflicts and improve match quality.",
  },
  {
    path: "/admin/skills",
    kicker: "Skill library",
    title: "Maintain a clean capability catalog",
    description: "Organize verified skill tags so helper profiles stay searchable and consistent.",
  },
  {
    path: "/admin/helper-skills",
    kicker: "Capability mapping",
    title: "Link helpers to their strongest skills",
    description: "Build more confident shortlists by keeping helper skill coverage complete.",
  },
  {
    path: "/admin/experience",
    kicker: "Work history",
    title: "Preserve employment history clearly",
    description: "Capture past roles and responsibilities to support employer trust during selection.",
  },
  {
    path: "/admin/documents",
    kicker: "Compliance",
    title: "Monitor document health and validity",
    description: "Track IDs, document status, and expiry details in one place.",
  },
  {
    path: "/admin/employers",
    kicker: "Family accounts",
    title: "Manage employers and household demand",
    description: "Keep contact details, preferences, budgets, and demand signals up to date.",
  },
  {
    path: "/admin/job-requests",
    kicker: "Demand intake",
    title: "Shape requests before placement begins",
    description: "Capture role needs, salary ranges, and start timelines before assigning helpers.",
  },
  {
    path: "/admin/assignments",
    kicker: "Placements",
    title: "Coordinate live placements with confidence",
    description: "Review active assignments, transitions, and completion status across the network.",
  },
  {
    path: "/admin/locations",
    kicker: "Coverage map",
    title: "Organize the operating footprint",
    description: "Maintain the location list used by helper profiles, employer records, and job requests.",
  },
];

function NavIcon({ name }) {
  return (
    <span className="nav-icon">
      <Icon name={name} size={18} />
    </span>
  );
}

function getPageMeta(pathname) {
  const match = PAGE_META.find(({ path }) => pathname === path || pathname.startsWith(`${path}/`));
  return match || PAGE_META[0];
}

export default function AdminLayout({ profile, onLogout }) {
  const location = useLocation();
  const activePage = getPageMeta(location.pathname);
  const totalModules = NAV_GROUPS.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <div className="app-page">
      <div className="app-shell">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <p className="eyebrow">Nano Online UAE</p>
            <p className="sidebar-title">Admin Console</p>
            <p className="sidebar-tagline">Placement operations for UAE households.</p>
          </div>

          <nav className="sidebar-nav">
            {NAV_GROUPS.map(({ label, items }) => (
              <div key={label} className="nav-section">
                <p className="nav-section-label">{label}</p>
                {items.map(({ path, text, icon }) => (
                  <NavLink key={path} to={path} className="nav-link">
                    <NavIcon name={icon} />
                    <span className="nav-link-text">{text}</span>
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="sidebar-user">
              <p className="sidebar-user-label">Signed in as</p>
              <p className="sidebar-user-name">{profile.username}</p>
            </div>
            <button type="button" onClick={onLogout} className="sidebar-logout">
              <Icon name="logout" size={16} />
              Logout
            </button>
          </div>
        </aside>

        <main className="main-content">
          <section className="content-hero">
            <div className="content-hero-copy">
              <p className="content-kicker">{activePage.kicker}</p>
              <h1 className="content-title">{activePage.title}</h1>
              <p className="content-subtitle">{activePage.description}</p>
            </div>

            <div className="content-hero-stats">
              <div className="hero-stat-card">
                <div className="hero-stat-head">
                  <span className="hero-stat-card-icon"><Icon name="workspace" size={18} /></span>
                  <span className="hero-stat-label">Workspace</span>
                </div>
                <strong className="hero-stat-value">{totalModules} modules</strong>
              </div>
              <div className="hero-stat-card accent">
                <div className="hero-stat-head">
                  <span className="hero-stat-card-icon"><Icon name="secure" size={18} /></span>
                  <span className="hero-stat-label">Session</span>
                </div>
                <strong className="hero-stat-value">Admin secure</strong>
              </div>
              <div className="hero-stat-card muted">
                <div className="hero-stat-head">
                  <span className="hero-stat-card-icon"><Icon name="target" size={18} /></span>
                  <span className="hero-stat-label">Focus</span>
                </div>
                <strong className="hero-stat-value">Fast placement flow</strong>
              </div>
            </div>
          </section>

          <Outlet />
        </main>
      </div>
    </div>
  );
}

