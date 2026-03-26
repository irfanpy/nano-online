import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStats } from "../api.js";
import Icon from "../components/Icon.jsx";

const SECTIONS = [
  {
    heading: "Helpers",
    cards: [
      { label: "Total Helpers",  key: "helpers_total",  to: "/admin/helpers",  icon: "helpers" },
      { label: "Active Helpers", key: "helpers_active", to: "/admin/helpers",  icon: "helpers-active" },
      { label: "Roles",          key: "roles",          to: "/admin/roles",    icon: "roles" },
    ],
  },
  {
    heading: "Placements",
    cards: [
      { label: "Employers / Families", key: "employers",          to: "/admin/employers",    icon: "employers" },
      { label: "Open Job Requests",    key: "job_requests_open",  to: "/admin/job-requests", icon: "job-requests" },
      { label: "Total Job Requests",   key: "job_requests_total", to: "/admin/job-requests", icon: "folder" },
      { label: "Active Assignments",   key: "assignments_active", to: "/admin/assignments",  icon: "assignments" },
      { label: "Total Assignments",    key: "assignments_total",  to: "/admin/assignments",  icon: "clipboard" },
    ],
  },
  {
    heading: "Profiles",
    cards: [
      { label: "Availability Records", key: "availability_records", to: "/admin/availability", icon: "availability" },
      { label: "Skills Catalog",       key: "skills",               to: "/admin/skills",       icon: "skills" },
      { label: "Experience Records",   key: "experience_records",   to: "/admin/experience",   icon: "experience" },
      { label: "Active Documents",     key: "documents_active",     to: "/admin/documents",    icon: "document-check" },
      { label: "Total Documents",      key: "documents_total",      to: "/admin/documents",    icon: "documents" },
    ],
  },
  {
    heading: "Setup",
    cards: [
      { label: "Locations", key: "locations", to: "/admin/locations", icon: "locations" },
    ],
  },
];

export default function DashboardPage({ token }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getStats(token)
      .then(setStats)
      .catch((err) => setError(err.message));
  }, [token]);

  return (
    <section className="panel">
      <h2>Dashboard</h2>
      <p className="subtitle">Overview of all operational modules.</p>

      {error ? <p className="status">{error}</p> : null}

      {SECTIONS.map(({ heading, cards }) => (
        <div key={heading} className="dashboard-section">
          <h3 className="dashboard-section-title">{heading}</h3>
          <div className="stats-grid">
            {cards.map(({ label, key, to, icon }) => (
              <Link key={key} to={to} className="stat-box stat-link">
                <span className="stat-card-icon">
                  <Icon name={icon} size={22} />
                </span>
                <p className="stat-label">{label}</p>
                <p className="stat-value">{stats ? (stats[key] ?? 0) : "—"}</p>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
