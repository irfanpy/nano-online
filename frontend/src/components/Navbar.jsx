import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "Home", end: true },
  { to: "/services", label: "Services" },
  { to: "/helpers", label: "Helpers" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
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
        </nav>
      </div>
    </header>
  );
}
