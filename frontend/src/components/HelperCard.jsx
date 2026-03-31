import { Link } from "react-router-dom";

function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "Rate on request";
  }
  return `AED ${Number(value).toFixed(0)}/hr`;
}

export default function HelperCard({ helper }) {
  const name = helper.full_name || helper.name || "Helper";
  const role = helper.role_name || helper.category || helper.role || "Home helper";
  const experience =
    helper.experience_years || helper.experience || helper.years_experience || "-";
  const hourlyRate = helper.hourly_rate || helper.hourlyRate || helper.rate_per_hour || helper.rate;
  const rating = helper.rating || helper.average_rating || helper.review_score || "4.8";
  const isAvailable = helper.is_available ?? helper.is_active ?? true;

  return (
    <article className="helper-card">
      <header className="helper-card-header">
        <div>
          <h3>{name}</h3>
          <p className="helper-meta">{role}</p>
        </div>
        <span className={`helper-badge ${isAvailable ? "available" : "busy"}`}>
          {isAvailable ? "Available" : "Limited"}
        </span>
      </header>

      <div className="helper-card-body">
        <p className="helper-meta">Experience: {experience} yrs</p>
        <p className="helper-meta">Rating: {rating}</p>
        <p className="helper-price">{formatCurrency(hourlyRate)}</p>
      </div>

      <footer className="helper-card-footer">
        <Link to={`/helpers/${helper.id}`} className="button-link">
          View details
        </Link>
        <Link to={`/helpers/${helper.id}#book`} className="button-link primary">
          Hire
        </Link>
      </footer>
    </article>
  );
}
