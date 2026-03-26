import { Link } from "react-router-dom";

export default function ServiceCard({ service }) {
  return (
    <article className="service-card">
      <div className="service-card-icon" aria-hidden="true">
        {service.iconLabel}
      </div>
      <h3>{service.title}</h3>
      <p>{service.description}</p>
      <Link to={`/services#${service.slug}`} className="service-card-link">
        View Details
      </Link>
    </article>
  );
}
