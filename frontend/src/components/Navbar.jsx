import { NavLink } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext.jsx";

const NAV_ITEMS = [
  { to: "/", label: "Home", end: true },
  { to: "/services", label: "Services" },
  { to: "/helpers", label: "Helpers" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { isAuthenticated, user, logout } = useUserAuth();

  return (
    <header className="public-header">
      <div className="public-container public-header-inner">
        <NavLink to="/" end className="public-logo" aria-label="Nano Online Home">
          <span className="public-logo-mark">NO</span>
          <span className="public-logo-text">Nano Online Dubai</span>
        </NavLink>

        <nav className="public-nav" aria-label="Primary">
          {NAV_ITEMS.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className="public-nav-link">
              {label}
            </NavLink>
          ))}
          {isAuthenticated ? (
            <NavLink to="/dashboard" className="public-nav-link">
              {user?.name || user?.email || "Dashboard"}
            </NavLink>
          ) : (
            <NavLink to="/login" className="public-nav-link">
              Sign in
            </NavLink>
          )}
          {isAuthenticated ? (
            <button type="button" className="public-nav-button" onClick={logout}>
              Sign out
            </button>
          ) : (
            <NavLink to="/register" className="public-nav-link highlight">
              Get started
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
